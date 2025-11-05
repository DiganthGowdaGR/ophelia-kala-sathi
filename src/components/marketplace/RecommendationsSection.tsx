import { Link } from 'react-router-dom';
import { TrendingUp, Eye } from 'lucide-react';
import type { Product } from '@/types';

interface RecommendationsSectionProps {
  recommendations: Product[];
  recentlyViewed: Product[];
}

export default function RecommendationsSection({ 
  recommendations, 
  recentlyViewed 
}: RecommendationsSectionProps) {
  if (recommendations.length === 0 && recentlyViewed.length === 0) {
    return null;
  }

  const ProductMiniCard = ({ product, variant = 'default' }: { product: Product; variant?: 'default' | 'recent' }) => (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
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
          
          {/* Status indicator */}
          <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
            variant === 'recent' ? 'bg-gray-400' : 'bg-green-400'
          }`}></div>
        </div>
        
        <div className="p-3">
          <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm mb-1">
            {product.name}
          </h4>
          <p className="text-sm font-bold text-gray-900">
            ${product.price.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="mb-8 space-y-8">
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
              <p className="text-sm text-gray-600">Based on your preferences and browsing history</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recommendations.map((product) => (
              <ProductMiniCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed Section */}
      {recentlyViewed.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Eye className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recently Viewed</h2>
              <p className="text-sm text-gray-600">Your browsing history</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recentlyViewed.map((product) => (
              <ProductMiniCard key={product.id} product={product} variant="recent" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}