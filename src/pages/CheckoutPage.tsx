import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import { CreditCard, Lock } from 'lucide-react';
import type { ShoppingCartItem } from '@/types';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<ShoppingCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadCart = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('shopping_cart')
        .select(`
          *,
          product:artisan_products(*)
        `)
        .eq('customer_id', user?.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const total = cartItems.reduce((sum, item) => {
        const product = item.product as any;
        return sum + (product?.price || 0) * item.quantity;
      }, 0);

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_id: user?.id,
          total_amount: total,
          status: 'pending',
          shipping_address: shippingInfo.address,
          shipping_city: shippingInfo.city,
          shipping_state: shippingInfo.state,
          shipping_zip: shippingInfo.zip,
          shipping_country: shippingInfo.country,
          customer_name: shippingInfo.name,
          customer_email: shippingInfo.email,
          customer_phone: shippingInfo.phone
        }])
        .select()
        .maybeSingle();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      // Create order items
      const orderItems = cartItems.map(item => {
        const product = item.product as any;
        return {
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          price: product?.price || 0,
          subtotal: (product?.price || 0) * item.quantity
        };
      });

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Process payment through edge function
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('process-payment', {
        body: {
          orderId: orderId,
          amount: total,
          currency: 'USD',
          paymentMethodId: 'pm_card_visa' // Mock payment method
        }
      });

      if (paymentError) throw paymentError;

      // Clear cart
      await supabase
        .from('shopping_cart')
        .delete()
        .eq('customer_id', user?.id);

      alert('Order placed successfully!');
      navigate('/marketplace');
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Payment failed: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const product = item.product as any;
    return sum + (product?.price || 0) * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary">
        <Navigation />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-h1 font-bold text-text-primary mb-8">Checkout</h1>

        <form onSubmit={handleCheckout} className="space-y-8">
          {/* Shipping Information */}
          <div className="bg-background rounded-lg shadow-xl p-6">
            <h2 className="text-h2 font-bold text-text-primary mb-6">Shipping Information</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.name}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, name: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={shippingInfo.email}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-body-sm font-medium text-text-secondary mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-body-sm font-medium text-text-secondary mb-2">Address</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">City</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.city}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">State</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.state}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">ZIP Code</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.zip}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-body-sm font-medium text-text-secondary mb-2">Country</label>
                <input
                  type="text"
                  required
                  value={shippingInfo.country}
                  onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-background rounded-lg shadow-xl p-6">
            <h2 className="text-h2 font-bold text-text-primary mb-6">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              {cartItems.map(item => {
                const product = item.product as any;
                return (
                  <div key={item.id} className="flex justify-between text-text-secondary">
                    <span>{product?.name} x {item.quantity}</span>
                    <span>${((product?.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
              
              <div className="border-t pt-3 flex justify-between text-xl font-bold text-text-primary">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="bg-background rounded-lg shadow-xl p-6">
            <div className="flex items-center space-x-2 text-text-secondary mb-4">
              <Lock className="w-5 h-5" />
              <span className="text-sm">Secure Payment Processing</span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-accent transition disabled:opacity-50 flex items-center justify-center space-x-2 uppercase tracking-button"
            >
              <CreditCard className="w-5 h-5" />
              <span>{processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}</span>
            </button>

            <p className="text-xs text-text-tertiary mt-4 text-center">
              This is a demo payment system. No actual charges will be made.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
