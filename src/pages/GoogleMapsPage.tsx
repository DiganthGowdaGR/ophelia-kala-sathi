import React, { useState } from 'react';
import { MapPin, Navigation, Layers, Radio, TrendingUp } from 'lucide-react';
import {
  ArtisanMapView,
  DeliveryRouteOptimizer,
  GeofenceManager,
  LocationTracker,
  HeatmapVisualization
} from '@/components/google-maps';

type TabType = 'map' | 'routes' | 'geofence' | 'tracking' | 'heatmap';

export default function GoogleMapsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('map');

  const tabs = [
    { id: 'map' as TabType, label: 'Artisan Map', icon: MapPin, description: 'Find artisans near you' },
    { id: 'routes' as TabType, label: 'Route Optimizer', icon: Navigation, description: 'Optimize delivery routes' },
    { id: 'geofence' as TabType, label: 'Geofencing', icon: Layers, description: 'Manage location boundaries' },
    { id: 'tracking' as TabType, label: 'Live Tracking', icon: Radio, description: 'Real-time location tracking' },
    { id: 'heatmap' as TabType, label: 'Activity Heatmap', icon: TrendingUp, description: 'Visualize search patterns' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                Location Services
              </h1>
              <p className="mt-2 text-gray-600">
                Discover artisans, optimize routes, and track deliveries in real-time
              </p>
            </div>
            <a
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    transition-colors duration-200
                    ${isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Description */}
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Panels */}
        <div className="animate-fadeIn">
          {activeTab === 'map' && <ArtisanMapView />}
          {activeTab === 'routes' && <DeliveryRouteOptimizer />}
          {activeTab === 'geofence' && <GeofenceManager />}
          {activeTab === 'tracking' && <LocationTracker />}
          {activeTab === 'heatmap' && <HeatmapVisualization />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Powered by Google Maps Platform
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Help
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Documentation
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
