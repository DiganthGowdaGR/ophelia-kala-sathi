import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, INDIAN_LANGUAGES } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ShoppingCart, User, LogOut, LayoutDashboard, MapPin, Search, Menu, X, Bell, Zap, ChevronDown, Globe } from 'lucide-react';

export default function Navigation() {
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [agentModeOpen, setAgentModeOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const currentLanguage = INDIAN_LANGUAGES.find(l => l.code === language);

  return (
    <header className="header-fixed">
      <nav className="border-b border-gray-200">
        <div className="container mx-auto px-5">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <span className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors">
                  Ophelia AI
                </span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link
                  to="/marketplace"
                  className="text-gray-600 hover:text-yellow-600 font-medium transition-colors link-underline"
                >
                  {t('nav.marketplace')}
                </Link>
                <Link
                  to="/find-artisans"
                  className="flex items-center space-x-1 text-gray-600 hover:text-yellow-600 font-medium transition-colors link-underline"
                >
                  <Search className="w-4 h-4" />
                  <span>{t('nav.findArtisans')}</span>
                </Link>
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Language Switcher */}
              <div className="relative group">
                <button
                  onClick={() => setLanguageOpen(!languageOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors border border-gray-200"
                  title={t('nav.selectLanguage')}
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{currentLanguage?.flag} {currentLanguage?.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {languageOpen && (
                  <div className="absolute right-0 mt-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0 bg-gray-50">
                      10 PRIMARY LANGUAGES
                    </div>
                    {INDIAN_LANGUAGES.slice(0, 10).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLanguageOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          language === lang.code
                            ? 'bg-yellow-50 text-yellow-700 font-semibold'
                            : 'text-gray-700 hover:bg-yellow-50'
                        }`}
                      >
                        <span className="text-lg mr-2">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-gray-500 ml-2">({lang.native})</span>
                      </button>
                    ))}
                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 sticky top-0 bg-gray-50 mt-1">
                      OTHER LANGUAGES
                    </div>
                    {INDIAN_LANGUAGES.slice(10).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLanguageOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          language === lang.code
                            ? 'bg-yellow-50 text-yellow-700 font-semibold'
                            : 'text-gray-700 hover:bg-yellow-50'
                        }`}
                      >
                        <span className="text-lg mr-2">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                        <span className="text-gray-500 ml-2">({lang.native})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <>
                  <Link
                    to="/notifications"
                    className="p-2 text-gray-600 hover:text-yellow-600 transition-colors"
                    title={t('nav.notifications')}
                  >
                    <Bell className="w-5 h-5" />
                  </Link>
                  
                  {profile?.role === 'artisan' && (
                    <>
                      <Link
                        to="/artisan/dashboard"
                        className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors link-underline"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{t('nav.dashboard')}</span>
                      </Link>
                      <Link
                        to="/artisan/creative-studio"
                        className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors link-underline"
                      >
                        <span>{t('nav.creativeStudio')}</span>
                      </Link>
                      <div className="relative group">
                        <button
                          onClick={() => setAgentModeOpen(!agentModeOpen)}
                          className="flex items-center space-x-1 text-gray-600 hover:text-yellow-600 transition-colors link-underline"
                        >
                          <Zap className="w-4 h-4" />
                          <span>{t('nav.agentMode')}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {agentModeOpen && (
                          <div className="absolute left-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                            <Link
                              to="/artisan/agentmode"
                              className="block px-4 py-2 text-gray-700 hover:bg-yellow-50 transition-colors text-sm font-medium"
                              onClick={() => setAgentModeOpen(false)}
                            >
                              <span className="font-semibold">{t('nav.agentMode')}</span>
                              <p className="text-xs text-gray-500 font-normal">{t('nav.socialPosting')}</p>
                            </Link>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {profile?.role === 'customer' && (
                    <Link
                      to="/cart"
                      className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors link-underline"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>{t('nav.cart')}</span>
                    </Link>
                  )}

                  <Link
                    to={profile?.role === 'artisan' ? '/artisan/profile' : '/profile'}
                    className="flex items-center space-x-2 text-gray-600 hover:text-yellow-600 transition-colors link-underline cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">{profile?.full_name || t('nav.profile')}</span>
                  </Link>

                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors link-underline"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-yellow-600 font-medium transition-colors link-underline"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    to="/signup"
                    className="btn-primary"
                  >
                    {t('nav.signUp')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-yellow-600 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4">
              <div className="space-y-4">
                {/* Mobile Language Switcher */}
                <div className="pb-4 border-b border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 mb-2 px-4">LANGUAGE</p>
                  <div className="grid grid-cols-5 gap-2 px-2">
                    {INDIAN_LANGUAGES.slice(0, 10).map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setMobileMenuOpen(false);
                        }}
                        className={`p-2 rounded-lg text-center transition-colors ${
                          language === lang.code
                            ? 'bg-yellow-100 border-2 border-yellow-600'
                            : 'bg-gray-100 border-2 border-gray-200 hover:bg-yellow-50'
                        }`}
                        title={lang.name}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <p className="text-xs font-medium mt-1">{lang.code.toUpperCase()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Link
                  to="/marketplace"
                  className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.marketplace')}
                </Link>
                <Link
                  to="/find-artisans"
                  className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('nav.findArtisans')}
                </Link>
                
                {user ? (
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    {profile?.role === 'artisan' && (
                      <>
                        <Link
                          to="/artisan/dashboard"
                          className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t('nav.dashboard')}
                        </Link>
                        <Link
                          to="/artisan/creative-studio"
                          className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {t('nav.creativeStudio')}
                        </Link>
                        <Link
                          to="/artisan/agentmode"
                          className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors flex items-center space-x-2"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Zap className="w-4 h-4" />
                          <span>{t('nav.agentMode')}</span>
                          <p className="text-xs text-gray-500">{t('nav.socialPosting')}</p>
                        </Link>
                      </>
                    )}
                    {profile?.role === 'customer' && (
                      <Link
                        to="/cart"
                        className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {t('nav.cart')}
                      </Link>
                    )}
                    <Link
                      to={profile?.role === 'artisan' ? '/artisan/profile' : '/profile'}
                      className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.profile')}
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMobileMenuOpen(false);
                      }}
                      className="block text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    <Link
                      to="/login"
                      className="block text-gray-600 hover:text-yellow-600 font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.login')}
                    </Link>
                    <Link
                      to="/signup"
                      className="block text-center btn-primary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.signUp')}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
