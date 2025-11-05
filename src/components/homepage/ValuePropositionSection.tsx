import { Link } from 'react-router-dom';
import { Target, Heart, ArrowRight, Globe, Shield, MessageCircle, Award, Eye, Compass, Star } from 'lucide-react';

function BenefitItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-yellow-600 mt-1 flex-shrink-0">{icon}</div>
      <p className="text-gray-600 text-sm leading-relaxed">{text}</p>
    </div>
  );
}

export default function ValuePropositionSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Two Worlds, <span className="text-yellow-600">One Platform</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connecting traditional artisans with modern buyers through AI-powered intelligence
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* For Artisans */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">For Artisans</h3>
                <p className="text-gray-600">Empower your craft business</p>
              </div>
            </div>
            <ul className="space-y-4 mb-6">
              <BenefitItem icon={<Target />} text="AI Business Intelligence: Optimize pricing, inventory, and marketing strategies" />
              <BenefitItem icon={<Globe />} text="Global Reach: Sell to customers in 195+ countries" />
              <BenefitItem icon={<MessageCircle />} text="Voice Commerce: Sell in 11 languages with voice commands" />
              <BenefitItem icon={<Shield />} text="Real-time Analytics: Track performance and grow your business" />
              <BenefitItem icon={<Compass />} text="Cultural Heritage: Preserve and celebrate your craft traditions" />
            </ul>
            <Link 
              to="/signup" 
              className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 hover:text-gray-900 transition-colors inline-flex items-center gap-2"
            >
              Start Growing Today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          
          {/* For Customers */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">For Customers</h3>
                <p className="text-gray-600">Discover authentic craftsmanship</p>
              </div>
            </div>
            <ul className="space-y-4 mb-6">
              <BenefitItem icon={<Award />} text="Authentic Products: Verified artisans with provenance tracking" />
              <BenefitItem icon={<Eye />} text="AR/VR Experience: Try products virtually before buying" />
              <BenefitItem icon={<Star />} text="AI Recommendations: Discover products perfect for you" />
              <BenefitItem icon={<Compass />} text="Cultural Stories: Learn the heritage behind each craft" />
              <BenefitItem icon={<MessageCircle />} text="Voice Shopping: Ask for products in your language" />
            </ul>
            <Link 
              to="/marketplace" 
              className="bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              Explore Collections <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}