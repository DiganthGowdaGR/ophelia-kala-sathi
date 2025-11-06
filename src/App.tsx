import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import './index.css';

// Eager load critical components
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';

// Lazy load all other pages to reduce bundle size
const ArtisanDashboard = lazy(() => import('@/pages/ArtisanDashboard'));
const CreativeStudioPage = lazy(() => import('@/pages/artisan/CreativeStudioPage'));
const AiAgentControlPage = lazy(() => import('@/pages/artisan/AiAgentControlPage'));
const MarketSimulationPage = lazy(() => import('@/pages/artisan/MarketSimulationPage'));
const SocialDistributionPage = lazy(() => import('@/pages/artisan/SocialDistributionPage'));
const VoiceMentorPage = lazy(() => import('@/pages/artisan/VoiceMentorPage'));
const AgentModePage = lazy(() => import('@/pages/artisan/AgentModePage'));
const CustomerMarketplace = lazy(() => import('@/pages/CustomerMarketplace'));
const ProductDetailsPage = lazy(() => import('@/pages/ProductDetailsPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const GoogleMapsPage = lazy(() => import('@/pages/GoogleMapsPage'));
const AIControlCenter = lazy(() => import('@/pages/artisan/AIControlCenter'));
const AIArtIntelligencePage = lazy(() => import('@/pages/artisan/AIArtIntelligencePage'));
const AIBusinessIntelligencePage = lazy(() => import('@/pages/artisan/AIBusinessIntelligencePage'));
const AICreativeHeritagePage = lazy(() => import('@/pages/artisan/AICreativeHeritagePage'));
const AIAutomationPage = lazy(() => import('@/pages/artisan/AIAutomationPage'));
const SocialCommercePage = lazy(() => import('@/pages/artisan/SocialCommercePage'));
const SustainabilityPage = lazy(() => import('@/pages/artisan/SustainabilityPage'));
const CrossBorderPage = lazy(() => import('@/pages/artisan/CrossBorderPage'));
const ArtisanProfilePage = lazy(() => import('@/pages/artisan/ArtisanProfilePage'));
const FindArtisansPage = lazy(() => import('@/pages/FindArtisansPage'));
const FindCustomersPage = lazy(() => import('@/pages/FindCustomersPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ArtisanChatbotPage = lazy(() => import('@/pages/ArtisanChatbotPage'));
const FloatingAIWidget = lazy(() => import('@/components/ai/FloatingAIWidget'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-accent mx-auto mb-4"></div>
        <p className="text-text-secondary text-lg">Loading...</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Floating widget loading fallback
function FloatingWidgetFallback() {
  return null; // Widget is optional, don't show fallback
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <BrowserRouter>
            {/* Floating AI Widget with separate Suspense boundary */}
            <Suspense fallback={<FloatingWidgetFallback />}>
              <FloatingAIWidget />
            </Suspense>

            {/* Main Routes with Suspense for lazy-loaded page components */}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes - eagerly loaded */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                
                {/* Customer routes - lazy loaded */}
                <Route path="/marketplace" element={<CustomerMarketplace />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                <Route 
                  path="/cart" 
                  element={
                    <ProtectedRoute>
                      <CartPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/checkout" 
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Artisan routes - lazy loaded */}
                <Route 
                  path="/artisan/dashboard" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/creative-studio" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <CreativeStudioPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/ai-agents" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AiAgentControlPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/market-simulation" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <MarketSimulationPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/social-distribution" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <SocialDistributionPage />
                    </ProtectedRoute>
                  } 
                />
                <Route
                  path="/artisan/voice-mentor"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <VoiceMentorPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/artisan/agentmode"
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AgentModePage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/maps" element={<GoogleMapsPage />} />
                
                {/* AI Feature routes - lazy loaded */}
                <Route 
                  path="/dashboard/ai" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AIControlCenter />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/ai/art-intelligence" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AIArtIntelligencePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/ai/business-intelligence" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AIBusinessIntelligencePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/ai/creative-heritage" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AICreativeHeritagePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard/ai/automation" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AIAutomationPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Additional feature routes - lazy loaded */}
                {/* Agent Mode Routes */}
                <Route 
                  path="/artisan/agent-mode/control-center" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <AIControlCenter />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/agent-mode/social-commerce" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <SocialCommercePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/agent-mode/sustainability" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <SustainabilityPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/agent-mode/cross-border" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <CrossBorderPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Legacy routes for backward compatibility */}
                <Route 
                  path="/artisan/social-commerce" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <SocialCommercePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/sustainability" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <SustainabilityPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/cross-border" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <CrossBorderPage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan/profile" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanProfilePage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Discovery routes - lazy loaded */}
                <Route path="/find-artisans" element={<FindArtisansPage />} />
                <Route 
                  path="/find-customers" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <FindCustomersPage />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Profile routes - lazy loaded */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <ProtectedRoute>
                      <div className="min-h-screen flex items-center justify-center">
                        <p className="text-gray-600">Notifications page coming soon</p>
                      </div>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/artisan-assistant" 
                  element={
                    <ProtectedRoute requiredRole="artisan">
                      <ArtisanChatbotPage />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Suspense>
            </BrowserRouter>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
