import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Navigation, Play, Pause, Square, Clock, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface TrackingSession {
  id: string;
  order_id?: number;
  driver_name?: string;
  status: 'active' | 'paused' | 'completed';
  start_time: string;
  end_time?: string;
}

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: string;
  speed?: number;
  accuracy?: number;
}

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export default function LocationTracker() {
  const [session, setSession] = useState<TrackingSession | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [currentLocation, setCurrentLocation] = useState<LocationPoint | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [center, setCenter] = useState(defaultCenter);
  const [statistics, setStatistics] = useState({
    total_distance: 0,
    duration_minutes: 0,
    avg_speed: 0,
    points_tracked: 0
  });

  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  // Load active tracking session
  useEffect(() => {
    loadActiveSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const loadActiveSession = async () => {
    try {
      const { data, error } = await supabase
        .from('location_tracking')
        .select('*')
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const activeSession = data[0];
        setSession({
          id: activeSession.id,
          order_id: activeSession.order_id,
          driver_name: activeSession.metadata?.driver_name,
          status: activeSession.status,
          start_time: activeSession.start_time,
          end_time: activeSession.end_time
        });

        // Load location history
        const locationPath = activeSession.location_path 
          ? (typeof activeSession.location_path === 'string' 
            ? JSON.parse(activeSession.location_path) 
            : activeSession.location_path)
          : [];
        
        setLocationHistory(locationPath);
        
        if (locationPath.length > 0) {
          const lastPoint = locationPath[locationPath.length - 1];
          setCurrentLocation(lastPoint);
          setCenter({ lat: lastPoint.lat, lng: lastPoint.lng });
        }

        setIsTracking(true);
        resumeTracking();
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const startTracking = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    try {
      // Create new tracking session
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/real-time-tracking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'start_tracking',
            metadata: {
              driver_name: 'Current User',
              device: navigator.userAgent
            }
          })
        }
      );

      const result = await response.json();
      
      if (result.session_id) {
        setSession({
          id: result.session_id,
          status: 'active',
          start_time: new Date().toISOString()
        });
        setIsTracking(true);
        setIsPaused(false);
        resumeTracking();
      }
    } catch (error) {
      console.error('Error starting tracking:', error);
      alert('Failed to start tracking. Please try again.');
    }
  };

  const resumeTracking = () => {
    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    // Start periodic updates
    intervalRef.current = setInterval(() => {
      calculateStatistics();
    }, 5000);
  };

  const handlePositionUpdate = async (position: GeolocationPosition) => {
    const newLocation: LocationPoint = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      timestamp: new Date().toISOString(),
      speed: position.coords.speed || undefined,
      accuracy: position.coords.accuracy
    };

    setCurrentLocation(newLocation);
    setLocationHistory(prev => [...prev, newLocation]);
    setCenter({ lat: newLocation.lat, lng: newLocation.lng });

    // Update backend
    if (session && !isPaused) {
      try {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/real-time-tracking`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              action: 'update_location',
              session_id: session.id,
              location: newLocation
            })
          }
        );
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  const handlePositionError = (error: GeolocationPositionError) => {
    console.error('Geolocation error:', error);
    let message = 'Failed to get location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out.';
        break;
    }
    
    alert(message);
  };

  const pauseTracking = () => {
    setIsPaused(true);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const resumeTrackingAfterPause = () => {
    setIsPaused(false);
    resumeTracking();
  };

  const stopTracking = async () => {
    if (!session) return;

    pauseTracking();
    
    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/real-time-tracking`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'stop_tracking',
            session_id: session.id
          })
        }
      );

      setIsTracking(false);
      setSession(null);
      alert('Tracking session ended successfully!');
    } catch (error) {
      console.error('Error stopping tracking:', error);
      alert('Failed to stop tracking properly.');
    }
  };

  const calculateStatistics = () => {
    if (locationHistory.length < 2) return;

    let totalDistance = 0;
    let totalSpeed = 0;
    let speedCount = 0;

    for (let i = 1; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];

      // Calculate distance using Haversine formula
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (prev.lat * Math.PI) / 180;
      const φ2 = (curr.lat * Math.PI) / 180;
      const Δφ = ((curr.lat - prev.lat) * Math.PI) / 180;
      const Δλ = ((curr.lng - prev.lng) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      totalDistance += distance;

      if (curr.speed !== undefined) {
        totalSpeed += curr.speed;
        speedCount++;
      }
    }

    const duration = session
      ? (new Date().getTime() - new Date(session.start_time).getTime()) / 1000 / 60
      : 0;

    setStatistics({
      total_distance: totalDistance / 1000, // Convert to km
      duration_minutes: Math.round(duration),
      avg_speed: speedCount > 0 ? totalSpeed / speedCount : 0,
      points_tracked: locationHistory.length
    });
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Navigation className="w-6 h-6 text-green-600" />
            Real-Time Location Tracker
          </h2>
          
          <div className="flex items-center gap-2">
            {!isTracking ? (
              <button
                onClick={startTracking}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Tracking
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={resumeTrackingAfterPause}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pauseTracking}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </button>
                )}
                <button
                  onClick={stopTracking}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Session Info */}
        {session && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-green-900">Active Tracking Session</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPaused 
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}>
                {isPaused ? 'Paused' : 'Active'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Session ID:</span>
                <span className="ml-2 font-mono text-gray-900">{session.id.slice(0, 8)}...</span>
              </div>
              <div>
                <span className="text-gray-600">Started:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(session.start_time).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        {isTracking && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-600">Distance</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {statistics.total_distance.toFixed(2)} km
              </div>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-600">Duration</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {statistics.duration_minutes} min
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-orange-600" />
                <span className="text-sm text-gray-600">Avg Speed</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {statistics.avg_speed.toFixed(1)} m/s
              </div>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-600">Points</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {statistics.points_tracked}
              </div>
            </div>
          </div>
        )}

        {/* Current Location Info */}
        {currentLocation && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold mb-2">Current Position</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Latitude:</span>
                <span className="ml-2 font-mono">{currentLocation.lat.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Longitude:</span>
                <span className="ml-2 font-mono">{currentLocation.lng.toFixed(6)}</span>
              </div>
              <div>
                <span className="text-gray-600">Accuracy:</span>
                <span className="ml-2">{currentLocation.accuracy?.toFixed(0) || 'N/A'}m</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Map Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        /* @ts-ignore */
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={15}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {/* Location History Path */}
          {locationHistory.length > 1 && (
            <Polyline
              path={locationHistory.map(point => ({ lat: point.lat, lng: point.lng }))}
              options={{
                strokeColor: '#10B981',
                strokeWeight: 4,
                strokeOpacity: 0.8
              }}
            />
          )}

          {/* Current Location Marker */}
          {currentLocation && (
            <Marker
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              onClick={() => setShowInfo(true)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#10B981',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 3
              }}
              animation={google.maps.Animation.BOUNCE}
            />
          )}

          {/* Info Window */}
          {showInfo && currentLocation && (
            <InfoWindow
              position={{ lat: currentLocation.lat, lng: currentLocation.lng }}
              onCloseClick={() => setShowInfo(false)}
            >
              <div className="p-2">
                <h3 className="font-semibold mb-1">Current Location</h3>
                <p className="text-sm text-gray-600">
                  {currentLocation.timestamp 
                    ? new Date(currentLocation.timestamp).toLocaleString()
                    : 'Unknown time'}
                </p>
                {currentLocation.speed !== undefined && (
                  <p className="text-sm">Speed: {currentLocation.speed.toFixed(1)} m/s</p>
                )}
              </div>
            </InfoWindow>
          )}

          {/* Start Point Marker */}
          {locationHistory.length > 0 && (
            <Marker
              position={{
                lat: locationHistory[0].lat,
                lng: locationHistory[0].lng
              }}
              label="Start"
              icon={{
                url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
