import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import Navigation from '@/components/shared/Navigation';
import { Trash2, Plus, Minus } from 'lucide-react';

/**
 * Shopping cart item
 */
interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string | null;
  price_at_addition: number;
  quantity: number;
}

/**
 * Shopping cart record from database
 */
interface ShoppingCart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Complete cart data including items and totals
 */
interface CartData {
  cart: ShoppingCart | null;
  items: CartItem[];
  total: number;
  itemCount: number;
}

export default function CartPage() {

  const [cartData, setCartData] = useState<CartData | null>(null);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const { user } = useAuth();

  const navigate = useNavigate();



  const loadCart = useCallback(async () => {

    if (!user) return;

    

    setLoading(true);

    setError(null);

    try {

      const { data, error: cartError } = await supabase.functions.invoke('cart-manager', {

        body: { action: 'get' }

      });



      if (cartError) throw cartError;

      setCartData(data);

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'Failed to load cart. Please try again.';

      console.error('Error loading cart:', err);

      setError(errorMessage);

      // Set empty cart on error

      setCartData({ cart: null, items: [], total: 0, itemCount: 0 });

    } finally {

      setLoading(false);

    }

  }, [user]);



  useEffect(() => {

    loadCart();

  }, [loadCart]);



  async function updateQuantity(productId: string, newQuantity: number) {

    if (newQuantity < 1) {

      // If quantity is 0, remove the item

      await removeItem(productId);

      return;

    }



    setUpdating(true);

    setError(null);

    try {

      const { data, error: updateError } = await supabase.functions.invoke('cart-manager', {

        body: { 

          action: 'update',

          productId,

          quantity: newQuantity

        }

      });



      if (updateError) throw updateError;

      setCartData(data);

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'Failed to update quantity. Please try again.';

      console.error('Error updating quantity:', err);

      setError(errorMessage);

    } finally {

      setUpdating(false);

    }

  }



  async function removeItem(productId: string) {

    setUpdating(true);

    setError(null);

    try {

      const { data, error: removeError } = await supabase.functions.invoke('cart-manager', {

        body: { 

          action: 'remove',

          productId

        }

      });



      if (removeError) throw removeError;

      setCartData(data);

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item. Please try again.';

      console.error('Error removing item:', err);

      setError(errorMessage);

    } finally {

      setUpdating(false);

    }

  }



  const total = cartData?.total || 0;

  const cartItems = cartData?.items || [];



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

      

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-16">

        <h1 className="text-h1 font-bold text-text-primary mb-8">Shopping Cart</h1>



        {error && (

          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">

            <p className="text-destructive font-medium">{error}</p>

            <button

              onClick={() => loadCart()}

              className="mt-2 text-destructive hover:text-destructive underline text-sm font-medium"

            >

              Try Again

            </button>

          </div>

        )}



        {cartItems.length === 0 ? (

          <div className="bg-background rounded-lg shadow-xl p-12 text-center">

            <p className="text-h3 text-text-secondary mb-6">Your cart is empty</p>

            <Link

              to="/marketplace"

              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-accent transition uppercase tracking-button"

            >

              Continue Shopping

            </Link>

          </div>

        ) : (

          <div className="grid lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-4">

              {cartItems.map(item => (

                <div key={item.id} className="bg-background rounded-lg shadow-xl p-6">

                  <div className="flex items-center space-x-6">

                    <div className="w-24 h-24 bg-secondary rounded-lg overflow-hidden flex-shrink-0">

                      {item.product_image ? (

                        <img

                          src={item.product_image}

                          alt={item.product_name}

                          className="w-full h-full object-cover"

                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-text-tertiary text-xs">

                          No Image

                        </div>

                      )}

                    </div>



                    <div className="flex-1">

                      <h3 className="font-semibold text-lg text-text-primary mb-1">

                        {item.product_name}

                      </h3>

                      <p className="text-text-secondary">

                        ${item.price_at_addition.toFixed(2)} each

                      </p>

                    </div>



                    <div className="flex items-center space-x-4">

                      <div className="flex items-center space-x-2">

                        <button

                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}

                          disabled={updating}

                          className="p-1 rounded-lg border border-border hover:bg-secondary disabled:opacity-50"

                        >

                          <Minus className="w-4 h-4" />

                        </button>

                        <span className="w-12 text-center font-semibold">

                          {item.quantity}

                        </span>

                        <button

                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}

                          disabled={updating}

                          className="p-1 rounded-lg border border-border hover:bg-secondary disabled:opacity-50"

                        >

                          <Plus className="w-4 h-4" />

                        </button>

                      </div>



                      <button

                        onClick={() => removeItem(item.product_id)}

                        disabled={updating}

                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition disabled:opacity-50"

                      >

                        <Trash2 className="w-5 h-5" />

                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>



            <div className="lg:col-span-1">

              <div className="bg-background rounded-lg shadow-xl p-6 sticky top-4">

                <h2 className="text-h2 font-bold text-text-primary mb-6">Order Summary</h2>

                

                <div className="space-y-3 mb-6">

                  <div className="flex justify-between text-text-secondary">

                    <span>Subtotal ({cartData?.itemCount} items)</span>

                    <span>${total.toFixed(2)}</span>

                  </div>

                  <div className="flex justify-between text-text-secondary">

                    <span>Shipping</span>

                    <span>Calculated at checkout</span>

                  </div>

                  <div className="border-t pt-3 flex justify-between text-xl font-bold text-text-primary">

                    <span>Total</span>

                    <span>${total.toFixed(2)}</span>

                  </div>

                </div>



                <button

                  onClick={() => navigate('/checkout')}

                  className="w-full bg-primary text-white px-6 py-4 rounded-lg font-semibold hover:bg-accent transition uppercase tracking-button"

                >

                  Proceed to Checkout

                </button>



                <Link

                  to="/marketplace"

                  className="block text-center text-accent font-semibold mt-4 hover:text-accent"

                >

                  Continue Shopping

                </Link>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}
