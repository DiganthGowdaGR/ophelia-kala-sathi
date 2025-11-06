import React, { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, TrendingUp, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface HeatmapData {
  location: google.maps.LatLng;
  weight?: number;
}

interface SearchQuery {
  id: string;
  query: string;
  lat: number;
  lng: number;
  timestamp: string;
  result_count: number;
}

const containerStyle = {
  width: '100%',
  height: '600px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const libraries: ("visualization")[] = ["visualization"];

export default function HeatmapVisualization() {
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [searchQueries, setSearchQueries] = useState<SearchQuery[]>([]);
  const [heatmapLayer, setHeatmapLayer] = useState<google.maps.visualization.HeatmapLayer | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [dataType, setDataType] = useState<'searches' | 'artisan_density' | 'orders'>('searches');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [intensity, setIntensity] = useState(1);
  const [radius, setRadius] = useState(20);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total_searches: 0,
    unique_locations: 0,
    top_query: '',
    peak_area: ''
  });

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

  // Helper functions declared first
  const calculateStatistics = (data: any[]) => {
    const searchData = data.filter(item => item.search_query);
    
    const queryCount: { [key: string]: number } = {};
    searchData.forEach(item => {
      const query = item.search_query.toLowerCase();
      queryCount[query] = (queryCount[query] || 0) + 1;
    });

    const topQuery = Object.entries(queryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const uniqueLocations = new Set(
      data.map(item => `${item.lat},${item.lng}`)
    ).size;

    setStats({
      total_searches: searchData.length,
      unique_locations: uniqueLocations,
      top_query: topQuery,
      peak_area: 'City Center'
    });
  };

  // Load heatmap data function
  const loadHeatmapData = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('heatmap_and_searches').select('*');

      if (timeRange !== 'all') {
        const now = new Date();
        const startDate = new Date();
        
        switch (timeRange) {
          case '24h':
            startDate.setHours(now.getHours() - 24);
            break;
          case '7d':
            startDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            startDate.setDate(now.getDate() - 30);
            break;
        }
        
        query = query.gte('created_at', startDate.toISOString());
      }

      if (dataType === 'searches') {
        query = query.not('search_query', 'is', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      if (data && isLoaded) {
        const heatmapPoints: HeatmapData[] = data
          .filter(item => item.lat && item.lng)
          .map(item => ({
            location: new google.maps.LatLng(
              parseFloat(item.lat),
              parseFloat(item.lng)
            ),
            weight: item.weight || 1
          }));

        setHeatmapData(heatmapPoints);

        const queries: SearchQuery[] = data
          .filter(item => item.search_query)
          .map(item => ({
            id: item.id,
            query: item.search_query,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lng),
            timestamp: item.created_at,
            result_count: item.result_count || 0
          }));

        setSearchQueries(queries);
        calculateStatistics(data);

        if (heatmapPoints.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          heatmapPoints.forEach(point => bounds.extend(point.location));
          mapInstance?.fitBounds(bounds);
        }
      }
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setLoading(false);
    }
  }, [dataType, timeRange, isLoaded, mapInstance]);

  // Update heatmap layer function
  const updateHeatmapLayer = useCallback(() => {
    if (!mapInstance || !isLoaded) return;

    if (heatmapLayer) {
      heatmapLayer.setMap(null);
    }

    const newHeatmapLayer = new google.maps.visualization.HeatmapLayer({
      data: heatmapData.map(point => ({
        location: point.location,
        weight: (point.weight || 1) * intensity
      })),
      map: mapInstance,
      radius: radius,
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
    });

    setHeatmapLayer(newHeatmapLayer);
  }, [heatmapData, intensity, radius, isLoaded, mapInstance, heatmapLayer]);

  // Map load handler
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // Effects
  useEffect(() => {
    if (isLoaded && mapInstance) {
      loadHeatmapData();
    }
  }, [isLoaded, mapInstance, loadHeatmapData]);

  useEffect(() => {
    if (heatmapLayer && heatmapData.length > 0) {
      updateHeatmapLayer();
    }
  }, [heatmapData, intensity, radius, updateHeatmapLayer, heatmapLayer]);

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
            <TrendingUp className="w-6 h-6 text-red-600" />
            Search & Activity Heatmap
          </h2>
          <button
            onClick={loadHeatmapData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-600">Total Searches</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {stats.total_searches}
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Unique Locations</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {stats.unique_locations}
            </div>
          </div>

          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-gray-600">Top Query</span>
            </div>
            <div className="text-sm font-bold text-orange-900 truncate">
              {stats.top_query}
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <span className="text-sm text-gray-600">Peak Area</span>
            </div>
            <div className="text-sm font-bold text-green-900">
              {stats.peak_area}
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold">Filters & Settings</h3>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data Type
              </label>
              <select
                value={dataType}
                onChange={(e) => setDataType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="searches">Search Queries</option>
                <option value="artisan_density">Artisan Density</option>
                <option value="orders">Order Activity</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Range
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Intensity: {intensity.toFixed(1)}
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={intensity}
                onChange={(e) => setIntensity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Radius: {radius}px
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {searchQueries.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-600" />
              Recent Search Queries
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchQueries.slice(0, 10).map((query) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer"
                  onClick={() => setCenter({ lat: query.lat, lng: query.lng })}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{query.query}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(query.timestamp).toLocaleString()} • {query.result_count} results
                    </div>
                  </div>
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
              ))}
            </div>
          </div>
        )}

        {heatmapData.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-900 mb-2">No Heatmap Data Available</h3>
              <p className="text-blue-700">Search activity data will appear here once users start searching for artisans and products.</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* @ts-ignore */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={12}
          onLoad={handleMapLoad}
          options={{
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: true,
            fullscreenControl: true
          }}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold mb-3">Heatmap Legend</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Low Activity</span>
          <div className="flex-1 h-4 rounded" style={{
            background: 'linear-gradient(to right, rgba(0, 255, 255, 0.6), rgba(0, 0, 255, 0.6), rgba(255, 0, 0, 0.6))'
          }} />
          <span className="text-sm text-gray-600">High Activity</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Darker/redder areas indicate higher concentration of {dataType === 'searches' ? 'search queries' : 'activity'}
        </p>
      </div>
    </div>
  );
}
