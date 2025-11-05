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
  description?: string;
  type: 'circle' | 'polygon';
  center?: { lat: number; lng: number };
  radius?: number;
  coordinates?: { lat: number; lng: number }[];
  trigger_on_entry: boolean;
  trigger_on_exit: boolean;
  active: boolean;
  metadata?: any;
}

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const libraries: ("drawing" | "geometry")[] = ["drawing", "geometry"];

export default function GeofenceManager() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [selectedGeofence, setSelectedGeofence] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Load geofences from database
  useEffect(() => {
    loadGeofences();
  }, []);

  const loadGeofences = async () => {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedGeofences: Geofence[] = data.map(g => ({
          id: g.id,
          name: g.name,
          description: g.description,
          type: g.geofence_type as 'circle' | 'polygon',
          center: g.center_lat && g.center_lng 
            ? { lat: parseFloat(g.center_lat), lng: parseFloat(g.center_lng) }
            : undefined,
          radius: g.radius_meters ? parseFloat(g.radius_meters) : undefined,
          coordinates: g.polygon_coordinates 
            ? (typeof g.polygon_coordinates === 'string' 
              ? JSON.parse(g.polygon_coordinates) 
              : g.polygon_coordinates)
            : undefined,
          trigger_on_entry: g.trigger_on_entry,
          trigger_on_exit: g.trigger_on_exit,
          active: g.active,
          metadata: g.metadata
        }));
        setGeofences(formattedGeofences);
      }
    } catch (error) {
      console.error('Error loading geofences:', error);
    }
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingGeofence({
      id: '',
      name: '',
      type: 'circle',
      trigger_on_entry: true,
      trigger_on_exit: true,
      active: true
    });
  };

  const saveGeofence = async () => {
    if (!editingGeofence || !editingGeofence.name) {
      alert('Please provide a name for the geofence');
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geofencing-events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'create_geofence',
            geofence: {
              name: editingGeofence.name,
              description: editingGeofence.description,
              geofence_type: editingGeofence.type,
              center_lat: editingGeofence.center?.lat.toString(),
              center_lng: editingGeofence.center?.lng.toString(),
              radius_meters: editingGeofence.radius?.toString(),
              polygon_coordinates: editingGeofence.coordinates 
                ? JSON.stringify(editingGeofence.coordinates)
                : null,
              trigger_on_entry: editingGeofence.trigger_on_entry,
              trigger_on_exit: editingGeofence.trigger_on_exit,
              metadata: editingGeofence.metadata
            }
          })
        }
      );

      const result = await response.json();
      
      if (result.success) {
        await loadGeofences();
        cancelEdit();
        alert('Geofence created successfully!');
      } else {
        throw new Error(result.error || 'Failed to create geofence');
      }
    } catch (error) {
      console.error('Error saving geofence:', error);
      alert('Failed to save geofence. Please try again.');
    }
  };

  const deleteGeofence = async (id: string) => {
    if (!confirm('Are you sure you want to delete this geofence?')) return;

    try {
      const { error } = await supabase
        .from('geofences')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      setGeofences(prev => prev.filter(g => g.id !== id));
      setSelectedGeofence(null);
    } catch (error) {
      console.error('Error deleting geofence:', error);
      alert('Failed to delete geofence.');
    }
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingGeofence(null);
  };

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!isCreating || !editingGeofence) return;

    if (editingGeofence.type === 'circle') {
      setEditingGeofence(prev => prev ? {
        ...prev,
        center: {
          lat: e.latLng!.lat(),
          lng: e.latLng!.lng()
        },
        radius: 500 // Default 500 meters
      } : null);
    } else if (editingGeofence.type === 'polygon') {
      setEditingGeofence(prev => prev ? {
        ...prev,
        coordinates: [
          ...(prev.coordinates || []),
          {
            lat: e.latLng!.lat(),
            lng: e.latLng!.lng()
          }
        ]
      } : null);
    }
  }, [isCreating, editingGeofence]);

  const testGeofence = async (geofenceId: string) => {
    const geofence = geofences.find(g => g.id === geofenceId);
    if (!geofence) return;

    try {
      // Simulate an entry event
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geofencing-events`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            action: 'trigger_event',
            geofence_id: geofenceId,
            event_type: 'entry',
            location: geofence.center,
            metadata: { test: true }
          })
        }
      );

      const result = await response.json();
      alert(`Test event triggered successfully! Event ID: ${result.event_id || 'N/A'}`);
    } catch (error) {
      console.error('Error testing geofence:', error);
      alert('Failed to test geofence.');
    }
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
            <MapPin className="w-6 h-6 text-purple-600" />
            Geofence Manager
          </h2>
          <button
            onClick={startCreating}
            disabled={isCreating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Geofence
          </button>
        </div>

        {/* Geofence Creation Form */}
        {isCreating && editingGeofence && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-4">New Geofence</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={editingGeofence.name}
                  onChange={(e) => setEditingGeofence(prev => prev ? {...prev, name: e.target.value} : null)}
                  placeholder="Enter geofence name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={editingGeofence.type}
                  onChange={(e) => setEditingGeofence(prev => prev ? {
                    ...prev, 
                    type: e.target.value as 'circle' | 'polygon',
                    coordinates: undefined,
                    center: undefined,
                    radius: undefined
                  } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="circle">Circle</option>
                  <option value="polygon">Polygon</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingGeofence.description || ''}
                  onChange={(e) => setEditingGeofence(prev => prev ? {...prev, description: e.target.value} : null)}
                  placeholder="Enter description (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {editingGeofence.type === 'circle' && editingGeofence.radius && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Radius (meters)
                  </label>
                  <input
                    type="number"
                    value={editingGeofence.radius}
                    onChange={(e) => setEditingGeofence(prev => prev ? {...prev, radius: parseInt(e.target.value)} : null)}
                    min="50"
                    max="50000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingGeofence.trigger_on_entry}
                  onChange={(e) => setEditingGeofence(prev => prev ? {...prev, trigger_on_entry: e.target.checked} : null)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">Trigger on Entry</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingGeofence.trigger_on_exit}
                  onChange={(e) => setEditingGeofence(prev => prev ? {...prev, trigger_on_exit: e.target.checked} : null)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm text-gray-700">Trigger on Exit</span>
              </label>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm text-blue-800">
              {editingGeofence.type === 'circle' 
                ? 'Click on the map to place the geofence center'
                : 'Click on the map to add polygon vertices. Click "Save" when done.'}
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveGeofence}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Geofence
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Geofence List */}
        <div className="space-y-2">
          <h3 className="font-semibold mb-3">Active Geofences ({geofences.length})</h3>
          {geofences.map((geofence) => (
            <div
              key={geofence.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedGeofence === geofence.id
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedGeofence(geofence.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{geofence.name}</h4>
                  {geofence.description && (
                    <p className="text-sm text-gray-600 mt-1">{geofence.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="capitalize">{geofence.type}</span>
                    {geofence.type === 'circle' && geofence.radius && (
                      <span>{geofence.radius}m radius</span>
                    )}
                    {geofence.trigger_on_entry && (
                      <span className="text-green-600">Entry</span>
                    )}
                    {geofence.trigger_on_exit && (
                      <span className="text-orange-600">Exit</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      testGeofence(geofence.id);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Test Geofence"
                  >
                    <Zap className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGeofence(geofence.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {geofences.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No geofences created yet. Click "Create Geofence" to get started.
            </div>
          )}
        </div>
      </div>

      {/* Map Display */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onClick={handleMapClick}
          onLoad={setMapInstance}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        >
          {/* Render existing geofences */}
          {geofences.map((geofence) => (
            <React.Fragment key={geofence.id}>
              {geofence.type === 'circle' && geofence.center && geofence.radius && (
                <>
                  <Circle
                    center={geofence.center}
                    radius={geofence.radius}
                    options={{
                      fillColor: selectedGeofence === geofence.id ? '#A855F7' : '#9CA3AF',
                      fillOpacity: 0.2,
                      strokeColor: selectedGeofence === geofence.id ? '#7C3AED' : '#6B7280',
                      strokeWeight: 2
                    }}
                  />
                  <Marker
                    position={geofence.center}
                    title={geofence.name}
                  />
                </>
              )}
              {geofence.type === 'polygon' && geofence.coordinates && geofence.coordinates.length > 0 && (
                <Polygon
                  paths={geofence.coordinates}
                  options={{
                    fillColor: selectedGeofence === geofence.id ? '#A855F7' : '#9CA3AF',
                    fillOpacity: 0.2,
                    strokeColor: selectedGeofence === geofence.id ? '#7C3AED' : '#6B7280',
                    strokeWeight: 2
                  }}
                />
              )}
            </React.Fragment>
          ))}

          {/* Render editing geofence */}
          {editingGeofence && editingGeofence.type === 'circle' && editingGeofence.center && (
            <>
              <Circle
                center={editingGeofence.center}
                radius={editingGeofence.radius || 500}
                options={{
                  fillColor: '#A855F7',
                  fillOpacity: 0.3,
                  strokeColor: '#7C3AED',
                  strokeWeight: 2,
                  editable: true
                }}
              />
              <Marker position={editingGeofence.center} />
            </>
          )}

          {editingGeofence && editingGeofence.type === 'polygon' && editingGeofence.coordinates && editingGeofence.coordinates.length > 0 && (
            <Polygon
              paths={editingGeofence.coordinates}
              options={{
                fillColor: '#A855F7',
                fillOpacity: 0.3,
                strokeColor: '#7C3AED',
                strokeWeight: 2
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
}
