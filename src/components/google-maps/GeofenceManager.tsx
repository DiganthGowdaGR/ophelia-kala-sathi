/* @ts-nocheck */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Circle, Polygon, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Plus, Edit2, Trash2, Save, X, AlertCircle, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface Geofence {
  id: string;
  name: string;
  type: 'circle' | 'polygon';
  center: { lat: number; lng: number };
  radius?: number; // for circle
  coordinates?: { lat: number; lng: number }[]; // for polygon
  isActive: boolean;
  createdAt: string;
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

export default function GeofenceManager() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - in production, this would come from your database
      const mockGeofences: Geofence[] = [
        {
          id: '1',
          name: 'Downtown Area',
          type: 'circle',
          center: { lat: 40.7128, lng: -74.0060 },
          radius: 2000,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Warehouse Zone',
          type: 'polygon',
          center: { lat: 40.7589, lng: -73.9851 },
          coordinates: [
            { lat: 40.7589, lng: -73.9851 },
            { lat: 40.7600, lng: -73.9800 },
            { lat: 40.7550, lng: -73.9750 },
            { lat: 40.7520, lng: -73.9820 }
          ],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];

      setGeofences(mockGeofences);
    } catch (err) {
      console.error('Error loading geofences:', err);
      setError('Failed to load geofences');
    } finally {
      setLoading(false);
    }
  };

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const startCreating = (type: 'circle' | 'polygon') => {
    const newGeofence: Geofence = {
      id: Date.now().toString(),
      name: `New ${type === 'circle' ? 'Circle' : 'Polygon'} Geofence`,
      type,
      center: defaultCenter,
      isActive: false,
      createdAt: new Date().toISOString()
    };

    if (type === 'circle') {
      newGeofence.radius = 1000;
    } else {
      newGeofence.coordinates = [defaultCenter];
    }

    setEditingGeofence(newGeofence);
    setIsCreating(true);
  };

  const saveGeofence = () => {
    if (!editingGeofence) return;

    if (editingGeofence.id.startsWith(Date.now().toString())) {
      // New geofence
      setGeofences([...geofences, editingGeofence]);
    } else {
      // Update existing
      setGeofences(geofences.map(g => 
        g.id === editingGeofence.id ? editingGeofence : g
      ));
    }

    setEditingGeofence(null);
    setIsCreating(false);
  };

  const deleteGeofence = (id: string) => {
    setGeofences(geofences.filter(g => g.id !== id));
    if (selectedGeofence?.id === id) {
      setSelectedGeofence(null);
    }
  };

  const toggleGeofence = (id: string) => {
    setGeofences(geofences.map(g => 
      g.id === id ? { ...g, isActive: !g.isActive } : g
    ));
  };

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
            <Zap className="w-6 h-6 text-yellow-600" />
            Geofence Manager
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => startCreating('circle')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Circle
            </button>
            <button
              onClick={() => startCreating('polygon')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Polygon
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading geofences...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Geofence List */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Geofences ({geofences.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {geofences.map((geofence) => (
                  <div
                    key={geofence.id}
                    className={`p-3 border rounded-lg cursor-pointer transition ${
                      selectedGeofence?.id === geofence.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!geofence.isActive ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedGeofence(geofence)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{geofence.name}</h4>
                        <p className="text-xs text-gray-600">
                          {geofence.type === 'circle' ? 'Circle' : 'Polygon'} • 
                          {geofence.isActive ? ' Active' : ' Inactive'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGeofence(geofence.id);
                          }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            geofence.isActive
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGeofence(geofence.id);
                          }}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Geofence Details */}
            <div className="lg:col-span-2">
              {selectedGeofence ? (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Edit2 className="w-5 h-5" />
                    Geofence Details
                  </h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={selectedGeofence.name}
                          onChange={(e) => setSelectedGeofence({
                            ...selectedGeofence,
                            name: e.target.value
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={selectedGeofence.type}
                          onChange={(e) => setSelectedGeofence({
                            ...selectedGeofence,
                            type: e.target.value as 'circle' | 'polygon'
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="circle">Circle</option>
                          <option value="polygon">Polygon</option>
                        </select>
                      </div>
                    </div>

                    {selectedGeofence.type === 'circle' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Radius (meters)
                        </label>
                        <input
                          type="number"
                          value={selectedGeofence.radius || 1000}
                          onChange={(e) => setSelectedGeofence({
                            ...selectedGeofence,
                            radius: parseInt(e.target.value)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedGeofence(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setGeofences(geofences.map(g => 
                            g.id === selectedGeofence.id ? selectedGeofence : g
                          ));
                          setSelectedGeofence(null);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-gray-900 mb-2">No Geofence Selected</h3>
                  <p className="text-gray-600">Select a geofence from the list to view and edit its details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Map Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        /* @ts-ignore */
        /* @ts-ignore */
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
          {/* Existing Geofences */}
          {geofences.map((geofence) => (
            <React.Fragment key={geofence.id}>
              {geofence.type === 'circle' && geofence.radius && (
                /* @ts-ignore */
                <Circle
                  center={geofence.center}
                  radius={geofence.radius}
                  options={{
                    fillColor: geofence.isActive ? '#3B82F6' : '#9CA3AF',
                    fillOpacity: 0.2,
                    strokeColor: geofence.isActive ? '#3B82F6' : '#9CA3AF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                  }}
                />
              )}
              {geofence.type === 'polygon' && geofence.coordinates && (
                /* @ts-ignore */
                <Polygon
                  paths={geofence.coordinates}
                  options={{
                    fillColor: geofence.isActive ? '#10B981' : '#9CA3AF',
                    fillOpacity: 0.2,
                    strokeColor: geofence.isActive ? '#10B981' : '#9CA3AF',
                    strokeOpacity: 0.8,
                    strokeWeight: 2
                  }}
                />
              )}
              /* @ts-ignore */
              /* @ts-ignore */
              <Marker
                position={geofence.center}
                title={geofence.name}
              />
            </React.Fragment>
          ))}

          {/* Editing Geofence */}
          {editingGeofence && (
            <React.Fragment>
              {editingGeofence.type === 'circle' && editingGeofence.radius && (
                /* @ts-ignore */
                <Circle
                  center={editingGeofence.center}
                  radius={editingGeofence.radius}
                  options={{
                    fillColor: '#F59E0B',
                    fillOpacity: 0.3,
                    strokeColor: '#F59E0B',
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    strokeDashArray: '5, 5'
                  }}
                />
              )}
              {editingGeofence.type === 'polygon' && editingGeofence.coordinates && (
                /* @ts-ignore */
                <Polygon
                  paths={editingGeofence.coordinates}
                  options={{
                    fillColor: '#F59E0B',
                    fillOpacity: 0.3,
                    strokeColor: '#F59E0B',
                    strokeOpacity: 1,
                    strokeWeight: 3,
                    strokeDashArray: '5, 5'
                  }}
                />
              )}
              /* @ts-ignore */
              /* @ts-ignore */
              <Marker position={editingGeofence.center} />
            </React.Fragment>
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
