'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface HistoryDataPoint {
  date: string;
  dailyStreams: number;
  totalStreams: number | null;
  rank: number;
}

interface TrackHistoryChartProps {
  trackName: string;
  artistName: string;
  country?: string;
  days?: number;
}

export default function TrackHistoryChart({ 
  trackName,
  artistName,
  country = 'global',
  days = 30 
}: TrackHistoryChartProps) {
  const [data, setData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/stats/tracks/history?trackName=${encodeURIComponent(trackName)}&artistName=${encodeURIComponent(artistName)}&country=${country}&days=${days}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch history data');
        }
        
        const result = await response.json();
        setData(result.history || []);
      } catch (err) {
        console.error('Error fetching track history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [trackName, artistName, country, days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No historical data available yet. Data will appear after multiple refreshes.
      </div>
    );
  }

  // Format data for display
  const chartData = data.map(point => ({
    ...point,
    date: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    streams: point.dailyStreams,
  }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Daily Streams Chart */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Daily Streams Trend</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              tickFormatter={formatNumber}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [formatNumber(value), 'Streams']}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="streams" 
              stroke="#1DB954" 
              strokeWidth={2}
              dot={{ fill: '#1DB954', r: 3 }}
              activeDot={{ r: 5 }}
              name="Daily Streams"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rank Chart (inverted - lower is better) */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Rank Trend (Lower is Better)</h4>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
              reversed
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#fff'
              }}
              formatter={(value: number) => [`#${value}`, 'Rank']}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF', fontSize: '12px' }}
            />
            <Line 
              type="monotone" 
              dataKey="rank" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 3 }}
              activeDot={{ r: 5 }}
              name="Rank"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-gray-500 text-center">
        Showing {data.length} data points over the last {days} days
      </div>
    </div>
  );
}