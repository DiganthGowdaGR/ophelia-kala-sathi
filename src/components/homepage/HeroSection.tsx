import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, Eye } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            AI-Powered Marketplace
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Ophelia AI
            <span className="block text-2xl md:text-4xl text-blue-600 mt-2">
              Marketplace
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empowering <strong className="text-gray-900">50,000+ artisans</strong> with AI-powered business intelligence, 
            supporting <strong className="text-gray-900">11 languages</strong>, voice commerce, and 
            <strong className="text-gray-900"> global reach</strong>.
          </p>
        </div>

        {/* Key Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12 text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-medium">50K+ Artisans</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-medium">11 Languages</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="font-medium">195 Countries</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link
            to="/signup"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Users className="w-5 h-5" />
            Join as Artisan
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/marketplace"
            className="bg-gray-100 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Explore Products
            <Eye className="w-5 h-5" />
          </Link>
        </div>

        {/* AI Assistant Preview */}
        <div className="bg-gray-50 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Your AI Business Assistant</h3>
              <p className="text-sm text-gray-600">Voice, Visual & Multi-language Support</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Voice: "How do I price my handwoven sari?"</span>
            </div>
            <div className="text-sm text-gray-600">
              "Based on market analysis, I recommend ₹2,500-₹3,500 for your silk sari. 
              Current trending colors are emerald green and deep maroon. Would you like marketing suggestions?"
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}