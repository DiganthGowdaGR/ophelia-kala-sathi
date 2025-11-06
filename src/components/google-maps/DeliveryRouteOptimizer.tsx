/* @ts-nocheck */
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation, Clock, Package, TrendingUp, AlertCircle, Trash2 } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Waypoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isWarehouse?: boolean;
}

interface DeliveryRoute {
  id: string;
  waypoints: Waypoint[];
  estimatedTime: number;
  totalDistance: number;
  status: 'pending' | 'in-progress' | 'completed';
}

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places", "geometry"];

export default function DeliveryRouteOptimizer() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationError, setOptimizationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  useEffect(() => {
    loadRoutes();
  }, []);

  useEffect(() => {
    if (isLoaded && waypoints.length > 0 && !selectedRoute) {
      calculateRoute();
    }
  }, [isLoaded, waypoints]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setOptimizationError(null);

      // Mock data - in production, this would come from your database
      const mockWaypoints: Waypoint[] = [
        {
          id: '1',
          name: 'Warehouse',
          address: '123 Main St, New York, NY',
          latitude: 40.7128,
          longitude: -74.0060,
          isWarehouse: true
        },
        {
          id: '2',
          name: 'Customer A',
          address: '456 Oak Ave, Brooklyn, NY',
          latitude: 40.6782,
          longitude: -73.9442
        },
        {
          id: '3',
          name: 'Customer B',
          address: '789 Pine St, Queens, NY',
          latitude: 40.7282,
          longitude: -73.7949
        },
        {
          id: '4',
          name: 'Customer C',
          address: '321 Elm Dr, Bronx, NY',
          latitude: 40.8448,
          longitude: -73.8648
        }
      ];

      setWaypoints(mockWaypoints);
    } catch (error) {
      console.error('Error loading routes:', error);
      setOptimizationError('Failed to load delivery routes');
    } finally {
      setLoading(false);
    }
  };

  const calculateRoute = () => {
    if (waypoints.length < 2) return;

    const directionsService = new google.maps.DirectionsService();
    const warehouse = waypoints.find(w => w.isWarehouse);
    const deliveryPoints = waypoints.filter(w => !w.isWarehouse);

    if (!warehouse || deliveryPoints.length === 0) return;

    const waypointLatLngs = deliveryPoints.map(point => ({
      location: new google.maps.LatLng(point.latitude, point.longitude),
      stopover: true
    }));

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(warehouse.latitude, warehouse.longitude),
      destination: new google.maps.LatLng(warehouse.latitude, warehouse.longitude),
      waypoints: waypointLatLngs,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: true
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        setDirections(result);
      } else {
        console.error('Directions request failed:', status);
        setOptimizationError('Failed to calculate route');
      }
    });
  };

  const optimizeRoute = () => {
    setIsOptimizing(true);
    setOptimizationError(null);

    // Simulate route optimization
    setTimeout(() => {
      try {
        // In a real implementation, this would use a route optimization algorithm
        // For now, we'll just use Google's built-in optimization
        calculateRoute();
        setIsOptimizing(false);
      } catch (error) {
        console.error('Route optimization error:', error);
        setOptimizationError('Failed to optimize route');
        setIsOptimizing(false);
      }
    }, 2000);
  };

  const addWaypoint = () => {
    const newWaypoint: Waypoint = {
      id: Date.now().toString(),
      name: `New Location ${waypoints.length + 1}`,
      address: 'Custom Address',
      latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
      longitude: -74.0060 + (Math.random() - 0.5) * 0.1
    };

    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter(w => w.id !== id));
  };

  const updateWaypoint = (id: string, updates: Partial<Waypoint>) => {
    setWaypoints(waypoints.map(w => 
      w.id === id ? { ...w, ...updates } : w
    ));
  };

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading Google Maps</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="text-center py-8">Loading Maps...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-blue-600" />
            Delivery Route Optimizer
          </h2>
          <div className="flex gap-2">
            <button
              onClick={addWaypoint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Add Stop
            </button>
            <button
              onClick={optimizeRoute}
              disabled={isOptimizing || waypoints.length < 2}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
            >
              {isOptimizing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4" />
              )}
              {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
            </button>
          </div>
        </div>

        {optimizationError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{optimizationError}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading delivery data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Waypoint List */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Delivery Stops ({waypoints.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {waypoints.map((waypoint, index) => (
                  <div
                    key={waypoint.id}
                    className={`p-3 border rounded-lg ${
                      waypoint.isWarehouse 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                          waypoint.isWarehouse 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-200 text-gray-700'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-medium text-sm">{waypoint.name}</h4>
                          <p className="text-xs text-gray-600">{waypoint.address}</p>
                        </div>
                      </div>
                      {!waypoint.isWarehouse && (
                        <button
                          onClick={() => removeWaypoint(waypoint.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Route Statistics */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Route Statistics
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-gray-600">Total Distance</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">
                    {directions?.routes[0]?.legs?.reduce((total, leg) => total + (leg.distance?.value || 0), 0) / 1000 || 0} km
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-600">Est. Time</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">
                    {Math.round((directions?.routes[0]?.legs?.reduce((total, leg) => total + (leg.duration?.value || 0), 0) || 0) / 60)} min
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    <span className="text-sm text-gray-600">Stops</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">
                    {waypoints.filter(w => !w.isWarehouse).length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* @ts-ignore */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={12}
          onLoad={handleMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {directions && (
            /* @ts-ignore */
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#4285F4',
                  strokeWeight: 5,
                  strokeOpacity: 0.8
                }
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
