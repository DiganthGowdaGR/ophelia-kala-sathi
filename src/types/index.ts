export interface User {
  id: string;
  email: string;
  role?: 'artisan' | 'customer' | 'admin';
}

export interface Profile {
  id: string;
  role: 'artisan' | 'customer' | 'admin';
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtisanProfile {
  id: string;
  user_id: string;
  business_name: string | null;
  bio: string | null;
  location: string | null;
  skills: string[];
  verification_status: 'pending' | 'verified' | 'rejected';
  portfolio_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  artisan_id: string;
  name: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  price: number;
  currency: string;
  stock_quantity: number;
  is_active: boolean;
  views: number;
  primary_image_url: string | null;
  created_at: string;
  updated_at: string;
  average_rating?: number;
  review_count?: number;
  view_count?: number;
  materials?: string;
  dimensions?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  created_at: string;
}

export interface ShoppingCartItem {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  product?: Product;
}

export interface Order {
  id: string;
  customer_id: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  artisan_id: string;
  date: string;
  views: number;
  product_clicks: number;
  orders_count: number;
  revenue: number;
  created_at: string;
}

export interface AIGeneratedContent {
  id: string;
  artisan_id: string;
  content_type: 'product_description' | 'social_post' | 'marketing_copy' | 'brand_story' | 'pricing_suggestion';
  content: string;
  metadata: Record<string, any> | null;
  status: 'active' | 'archived';
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
}
