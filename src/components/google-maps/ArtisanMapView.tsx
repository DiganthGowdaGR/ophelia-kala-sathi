import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, HeatmapLayer } from '@react-google-maps/api';
import { MapPin, Navigation, Users } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const mapContainerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

interface Artisan {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category: string;
  rating: number;
  distance?: number;
}

export default function ArtisanMapView() {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load artisan locations from database
  useEffect(() => {
    loadArtisanLocations();
  }, []);

  const loadArtisanLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: dbError } = await supabase
        .from('artisan_locations')
        .select('*')
        .eq('is_active', true);

      if (dbError) throw dbError;

      if (data && data.length > 0) {
        const artisanList: Artisan[] = data.map(location => ({
          id: location.id,
          name: location.artisan_name,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          category: location.business_type || 'Artisan',
          rating: location.rating || 4.5
        }));
        setArtisans(artisanList);
      } else {
        setError('No artisan locations found. Please add some artisans to the database first.');
      }
    } catch (err) {
      console.error('Error loading artisan locations:', err);
      setError('Failed to load artisan locations. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
    
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(pos);
          map.panTo(pos);
        },
        () => {
          console.log('Error getting location');
        }
      );
    }
  }, []);

  const handleMarkerClick = (artisan: Artisan) => {
    setSelectedArtisan(artisan);
  };

  const handleGetDirections = (artisan: Artisan) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${artisan.latitude},${artisan.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Prepare heatmap data
  const heatmapData = artisans.map(artisan => ({
    location: new google.maps.LatLng(artisan.latitude, artisan.longitude),
    weight: artisan.rating || 1
  }));

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading artisan locations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 mb-2">Unable to Load Artisan Locations</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={loadArtisanLocations}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (artisans.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <MapPin className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">No Artisan Locations Available</h3>
            <p className="text-blue-700">There are currently no artisan workshops registered in the system. Please check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['visualization']}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={handleLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {/* User location marker */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#4F46E5',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2
              }}
              title="Your Location"
            />
          )}

          {/* Artisan markers */}
          {artisans.map((artisan) => (
            <Marker
              key={artisan.id}
              position={{ lat: artisan.latitude, lng: artisan.longitude }}
              onClick={() => handleMarkerClick(artisan)}
              icon={{
                url: '/marker-artisan.png',
                scaledSize: new google.maps.Size(40, 40)
              }}
              title={artisan.name}
            />
          ))}

          {/* Info window for selected artisan */}
          {selectedArtisan && (
            <InfoWindow
              position={{ lat: selectedArtisan.latitude, lng: selectedArtisan.longitude }}
              onCloseClick={() => setSelectedArtisan(null)}
            >
              <div className="p-4 max-w-xs">
                <h3 className="font-bold text-lg mb-2">{selectedArtisan.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{selectedArtisan.category}</span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Rating: {selectedArtisan.rating}</span>
                </div>
                {selectedArtisan.distance && (
                  <p className="text-sm text-gray-600 mb-3">Distance: {selectedArtisan.distance.toFixed(1)} km</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGetDirections(selectedArtisan)}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    <Navigation className="w-3 h-3" />
                    Directions
                  </button>
                  <button
                    onClick={() => window.location.href = `/artisan/${selectedArtisan.id}`}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </InfoWindow>
          )}

          {/* Heatmap layer */}
          {showHeatmap && mapRef && (
            <HeatmapLayer
              data={heatmapData}
              options={{
                radius: 50,
                opacity: 0.6,
                gradient: [
                  'rgba(0, 255, 255, 0)',
                  'rgba(0, 255, 255, 1)',
                  'rgba(0, 191, 255, 1)',
                  'rgba(0, 127, 255, 1)',
                  'rgba(0, 63, 255, 1)',
                  'rgba(0, 0, 255, 1)',
                  'rgba(0, 0, 223, 1)',
                  'rgba(0, 0, 191, 1)',
                  'rgba(0, 0, 159, 1)',
                  'rgba(0, 0, 127, 1)',
                  'rgba(63, 0, 91, 1)',
                  'rgba(127, 0, 63, 1)',
                  'rgba(191, 0, 31, 1)',
                  'rgba(255, 0, 0, 1)'
                ]
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Map legend */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-indigo-600"></div>
            <span>Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-600" />
            <span>Artisan Workshop</span>
          </div>
          {showHeatmap && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-red-500"></div>
              <span>Artisan Density</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
