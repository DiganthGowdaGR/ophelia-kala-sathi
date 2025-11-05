import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Navigation, Clock, Package, TrendingUp, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Waypoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
  order_id?: number;
  customer_name?: string;
}

interface RouteOptimization {
  id: string;
  total_distance_km: number;
  estimated_time_minutes: number;
  optimized_sequence: string[];
  polyline: string;
  status: string;
}

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const libraries: ("places" | "geometry")[] = ["places", "geometry"];

export default function DeliveryRouteOptimizer() {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [selectedWaypoints, setSelectedWaypoints] = useState<string[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteOptimization | null>(null);
  const [newAddress, setNewAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [center, setCenter] = useState(defaultCenter);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Load existing waypoints from database
  useEffect(() => {
    loadWaypoints();
  }, []);

  const loadWaypoints = async () => {
    try {
      const { data, error } = await supabase
        .from('delivery_routes')
        .select('*, waypoints')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const route = data[0];
        if (route.waypoints) {
          const parsedWaypoints = typeof route.waypoints === 'string' 
            ? JSON.parse(route.waypoints) 
            : route.waypoints;
          setWaypoints(parsedWaypoints);
        }
      }
    } catch (error) {
      console.error('Error loading waypoints:', error);
    }
  };

  const addWaypoint = useCallback(async () => {
    if (!newAddress.trim() || !isLoaded) return;

    setLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ address: newAddress });

      if (result.results[0]) {
        const location = result.results[0].geometry.location;
        const newWaypoint: Waypoint = {
          id: `waypoint-${Date.now()}`,
          address: result.results[0].formatted_address,
          lat: location.lat(),
          lng: location.lng()
        };

        setWaypoints(prev => [...prev, newWaypoint]);
        setNewAddress('');
        
        // Center map on new waypoint
        setCenter({ lat: location.lat(), lng: location.lng() });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
    } finally {
      setLoading(false);
    }
  }, [newAddress, isLoaded]);

  const toggleWaypointSelection = (id: string) => {
    setSelectedWaypoints(prev => 
      prev.includes(id) 
        ? prev.filter(w => w !== id)
        : [...prev, id]
    );
  };

  const optimizeRoute = useCallback(async () => {
    if (selectedWaypoints.length < 2) {
      alert('Please select at least 2 waypoints to optimize');
      return;
    }

    setOptimizing(true);
    try {
      const selectedPoints = waypoints.filter(w => selectedWaypoints.includes(w.id));
      
      // Use Google Maps Directions API for route optimization
      const directionsService = new google.maps.DirectionsService();
      const origin = selectedPoints[0];
      const destination = selectedPoints[selectedPoints.length - 1];
      const waypointsForApi = selectedPoints.slice(1, -1).map(wp => ({
        location: new google.maps.LatLng(wp.lat, wp.lng),
        stopover: true
      }));

      const result = await directionsService.route({
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypointsForApi,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING
      });

      setDirections(result);

      // Calculate route metrics
      let totalDistance = 0;
      let totalDuration = 0;
      
      result.routes[0].legs.forEach(leg => {
        totalDistance += leg.distance?.value || 0;
        totalDuration += leg.duration?.value || 0;
      });

      const optimizedSequence = result.routes[0].waypoint_order.map(
        index => selectedPoints[index + 1].id
      );
      optimizedSequence.unshift(origin.id);
      optimizedSequence.push(destination.id);

      // Save to database via edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/route-optimization`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            waypoints: selectedPoints,
            total_distance_km: totalDistance / 1000,
            estimated_time_minutes: Math.round(totalDuration / 60),
            optimized_sequence: optimizedSequence,
            polyline: result.routes[0].overview_polyline
          })
        }
      );

      const data = await response.json();
      
      setRouteInfo({
        id: data.route_id,
        total_distance_km: totalDistance / 1000,
        estimated_time_minutes: Math.round(totalDuration / 60),
        optimized_sequence: optimizedSequence,
        polyline: result.routes[0].overview_polyline,
        status: 'optimized'
      });

    } catch (error) {
      console.error('Error optimizing route:', error);
      alert('Failed to optimize route. Please try again.');
    } finally {
      setOptimizing(false);
    }
  }, [selectedWaypoints, waypoints]);

  const removeWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(w => w.id !== id));
    setSelectedWaypoints(prev => prev.filter(w => w !== id));
  };

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
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
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Navigation className="w-6 h-6 text-blue-600" />
          Delivery Route Optimizer
        </h2>

        {/* Add Waypoint */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Delivery Location
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addWaypoint()}
              placeholder="Enter address or place name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={addWaypoint}
              disabled={loading || !newAddress.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Waypoint List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-600" />
            Delivery Stops ({waypoints.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {waypoints.map((waypoint, index) => (
              <div
                key={waypoint.id}
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedWaypoints.includes(waypoint.id)
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleWaypointSelection(waypoint.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedWaypoints.includes(waypoint.id)}
                  onChange={() => {}}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Stop {index + 1}</div>
                  <div className="text-sm text-gray-600">{waypoint.address}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWaypoint(waypoint.id);
                  }}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Optimize Button */}
        <button
          onClick={optimizeRoute}
          disabled={optimizing || selectedWaypoints.length < 2}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
        >
          <TrendingUp className="w-5 h-5" />
          {optimizing ? 'Optimizing Route...' : `Optimize Route (${selectedWaypoints.length} stops)`}
        </button>

        {/* Route Info */}
        {routeInfo && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-900 mb-3">Optimized Route</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm text-gray-600">Distance</div>
                  <div className="font-semibold">{routeInfo.total_distance_km.toFixed(2)} km</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm text-gray-600">Est. Time</div>
                  <div className="font-semibold">{routeInfo.estimated_time_minutes} min</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {/* Waypoint Markers */}
          {waypoints.map((waypoint, index) => (
            <Marker
              key={waypoint.id}
              position={{ lat: waypoint.lat, lng: waypoint.lng }}
              label={{
                text: (index + 1).toString(),
                color: 'white',
                fontWeight: 'bold'
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 20,
                fillColor: selectedWaypoints.includes(waypoint.id) ? '#3B82F6' : '#9CA3AF',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 2
              }}
            />
          ))}

          {/* Directions Renderer */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#10B981',
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
