import { Link } from 'react-router-dom';
import { Heart, Star, Eye } from 'lucide-react';
import type { Product, ArtisanProfile } from '@/types';

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  isInWishlist: boolean;
  onToggleWishlist: (productId: string, e: React.MouseEvent) => void;
  artisanProfile?: ArtisanProfile;
}

export default function ProductCard({ 
  product, 
  viewMode, 
  isInWishlist, 
  onToggleWishlist, 
  artisanProfile 
}: ProductCardProps) {
  if (viewMode === 'list') {
    return (
      <Link to={`/product/${product.id}`} className="group block">
        <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 p-4">
          <div className="flex gap-4">
            {/* Product Image */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
              {product.primary_image_url ? (
                <img
                  src={product.primary_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}

                  {/* Artisan Info */}
                  {artisanProfile && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-semibold">
                          {artisanProfile.business_name?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <span>{artisanProfile.business_name || 'Artisan'}</span>
                      {artisanProfile.location && (
                        <>
                          <span>•</span>
                          <span>{artisanProfile.location}</span>
                        </>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {product.category && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {product.category}
                      </span>
                    )}
                    
                    {product.average_rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{product.average_rating.toFixed(1)}</span>
                        {product.review_count && (
                          <span>({product.review_count})</span>
                        )}
                      </div>
                    )}

                    {product.view_count && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{product.view_count}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-xl font-bold text-gray-900 mb-2">
                    ${product.price.toFixed(2)}
                  </div>
                  
                  <div className="text-sm mb-3">
                    {product.stock_quantity > 0 ? (
                      <span className="text-green-600 font-medium">
                        {product.stock_quantity} in stock
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">Out of stock</span>
                    )}
                  </div>

                  <button
                    onClick={(e) => onToggleWishlist(product.id, e)}
                    className={`p-2 rounded-lg transition-colors ${
                      isInWishlist
                        ? 'bg-red-50 text-red-500 hover:bg-red-100'
                        : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* Product Image */}
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {product.primary_image_url ? (
            <img
              src={product.primary_image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          
          {/* Wishlist Button */}
          <button
            onClick={(e) => onToggleWishlist(product.id, e)}
            className={`absolute top-2 right-2 p-2 rounded-lg transition-colors ${
              isInWishlist
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-white/80 text-gray-400 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.stock_quantity === 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                Out of Stock
              </span>
            )}
            {product.average_rating && product.average_rating >= 4.5 && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium">
                Bestseller
              </span>
            )}
          </div>
        </div>
        
        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Artisan Info */}
          {artisanProfile && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-semibold">
                  {artisanProfile.business_name?.charAt(0) || 'A'}
                </span>
              </div>
              <span className="truncate">{artisanProfile.business_name || 'Artisan'}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <div className="text-lg font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </div>
            
            {product.category && (
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                {product.category}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              {product.average_rating ? (
                <>
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{product.average_rating.toFixed(1)}</span>
                  {product.review_count && (
                    <span className="text-gray-500">({product.review_count})</span>
                  )}
                </>
              ) : (
                <span className="text-gray-500">New Product</span>
              )}
            </div>

            <div className="text-sm">
              {product.stock_quantity > 0 ? (
                <span className="text-green-600 font-medium">
                  {product.stock_quantity} left
                </span>
              ) : (
                <span className="text-red-500 font-medium">Out of stock</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}