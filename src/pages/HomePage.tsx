import { Link } from 'react-router-dom';
import Navigation from '@/components/shared/Navigation';
import HeroSection from '@/components/homepage/HeroSection';
import ValuePropositionSection from '@/components/homepage/ValuePropositionSection';
import { CheckCircle, Zap, Globe, Mic } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary">
      <Navigation />
      
      <main className="content-with-fixed-nav">
        <HeroSection />
        <ValuePropositionSection />

        {/* Featured Stats Section */}
        <section className="section-padding bg-[--secondary]">
          <div className="container mx-auto">
            <div className="card-section">
              <div className="card-base text-center">
                <div className="text-4xl font-bold text-[--text-primary] mb-2">50K+</div>
                <div className="text-[--text-secondary]">Artisans Empowered</div>
              </div>
              <div className="card-base text-center">
                <div className="text-4xl font-bold text-[--text-primary] mb-2">2M+</div>
                <div className="text-[--text-secondary]">Products Sold</div>
              </div>
              <div className="card-base text-center">
                <div className="text-4xl font-bold text-[--text-primary] mb-2">195</div>
                <div className="text-[--text-secondary]">Countries Reached</div>
              </div>
              <div className="card-base text-center">
                <div className="text-4xl font-bold text-[--text-primary] mb-2">11</div>
                <div className="text-[--text-secondary]">Languages Supported</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="section-padding bg-[--primary]">
          <div className="container mx-auto">
            <div className="section-title">
              <h2 className="text-h2 mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-[--text-secondary] max-w-3xl mx-auto">
                Everything you need to succeed in the digital marketplace
              </p>
            </div>
            
            <div className="card-section">
              <div className="card-base card-hover">
                <div className="bg-[--accent] p-3 rounded-lg w-fit mb-4">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-h3 mb-3">AI Business Intelligence</h3>
                <p className="text-[--text-secondary]">Get data-driven insights to optimize your pricing, inventory, and marketing strategies.</p>
              </div>
              
              <div className="card-base card-hover">
                <div className="bg-[--accent] p-3 rounded-lg w-fit mb-4">
                  <Globe className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-h3 mb-3">Global Reach</h3>
                <p className="text-[--text-secondary]">Sell to customers worldwide with integrated international shipping and payments.</p>
              </div>
              
              <div className="card-base card-hover">
                <div className="bg-[--accent] p-3 rounded-lg w-fit mb-4">
                  <Mic className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-h3 mb-3">Voice Commerce</h3>
                <p className="text-[--text-secondary]">Enable customers to browse and buy using voice commands in their local language.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section-padding bg-gradient-dark">
          <div className="container mx-auto text-center">
            <h2 className="text-h2 text-white mb-6">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join thousands of artisans who are already growing their businesses with AI-powered intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/signup"
                className="btn-accent"
              >
                Join as Artisan
              </Link>
              <Link
                to="/marketplace"
                className="btn-secondary"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="footer-dark py-20">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              
              {/* Brand Section */}
              <div className="col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-[--accent] rounded-lg flex items-center justify-center">
                    <span className="text-black font-bold text-lg">O</span>
                  </div>
                  <span className="text-2xl font-bold text-white">Ophelia AI</span>
                </div>
                <p className="text-gray-300 max-w-md">
                  Empowering artisans through AI innovation. Where tradition meets technology.
                </p>
                <div className="mt-6">
                  <Link to="/ai-features" className="btn-primary">
                    Explore AI Features
                  </Link>
                </div>
              </div>
              
              {/* Quick Links */}
              <div>
                <h4 className="footer-heading">Quick Links</h4>
                <ul className="space-y-3">
                  <li><Link to="/marketplace" className="text-gray-300 hover:text-[--accent] transition-colors">Marketplace</Link></li>
                  <li><Link to="/signup" className="text-gray-300 hover:text-[--accent] transition-colors">Join as Artisan</Link></li>
                  <li><Link to="/find-artisans" className="text-gray-300 hover:text-[--accent] transition-colors">Find Artisans</Link></li>
                  <li><Link to="/about" className="text-gray-300 hover:text-[--accent] transition-colors">About Us</Link></li>
                </ul>
              </div>
              
              {/* Support */}
              <div>
                <h4 className="footer-heading">Support</h4>
                <ul className="space-y-3">
                  <li><Link to="/help" className="text-gray-300 hover:text-[--accent] transition-colors">Help Center</Link></li>
                  <li><Link to="/contact" className="text-gray-300 hover:text-[--accent] transition-colors">Contact Us</Link></li>
                  <li><Link to="/privacy" className="text-gray-300 hover:text-[--accent] transition-colors">Privacy Policy</Link></li>
                  <li><Link to="/terms" className="text-gray-300 hover:text-[--accent] transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="border-t border-gray-800 pt-12 mt-12">
              <div className="max-w-md mx-auto text-center">
                <h4 className="footer-heading">Stay Updated</h4>
                <p className="text-gray-300 mb-4">Get the latest AI features and marketplace updates</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="form-input flex-1"
                  />
                  <button className="btn-accent px-6">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-300">
              <p>&copy; 2025 Ophelia AI. All rights reserved. | Empowering artisans with AI technology.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
