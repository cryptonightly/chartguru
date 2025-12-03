'use client';

import { useEffect, useState } from 'react';
import { ArtistStat, TrackStat } from '@/lib/types';
import ArtistTableSideBySide from '@/components/ArtistTableSideBySide';
import TrackTable from '@/components/TrackTable';

export default function Home() {
  const [artists, setArtists] = useState<ArtistStat[]>([]);
  const [dailyMovers, setDailyMovers] = useState<ArtistStat[]>([]);
  const [tracks, setTracks] = useState<TrackStat[]>([]);
  const [nlArtists, setNlArtists] = useState<ArtistStat[]>([]);
  const [nlDailyMovers, setNlDailyMovers] = useState<ArtistStat[]>([]);
  const [nlTracks, setNlTracks] = useState<TrackStat[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [artistsRes, dailyMoversRes, tracksRes, nlArtistsRes, nlDailyMoversRes, nlTracksRes, lastUpdatedRes] = await Promise.all([
        fetch('/api/stats/artists?sortBy=rank&country=global'),
        fetch('/api/stats/artists?sortBy=dailyChange&limit=500&country=global'),
        fetch('/api/stats/tracks?country=global'),
        fetch('/api/stats/artists?sortBy=rank&country=nl'),
        fetch('/api/stats/artists?sortBy=dailyChange&limit=500&country=nl'),
        fetch('/api/stats/tracks?country=nl'),
        fetch('/api/stats/last-updated'),
      ]);

      const artistsData = await artistsRes.json();
      const dailyMoversData = await dailyMoversRes.json();
      const tracksData = await tracksRes.json();
      const nlArtistsData = await nlArtistsRes.json();
      const nlDailyMoversData = await nlDailyMoversRes.json();
      const nlTracksData = await nlTracksRes.json();
      const lastUpdatedData = await lastUpdatedRes.json();

      setArtists(artistsData.artists || []);
      setDailyMovers(dailyMoversData.artists || []);
      setTracks(tracksData.tracks || []);
      setNlArtists(nlArtistsData.artists || []);
      setNlDailyMovers(nlDailyMoversData.artists || []);
      setNlTracks(nlTracksData.tracks || []);
      setLastUpdated(lastUpdatedData.lastUpdated);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const adminSecret = prompt('Enter admin secret:');
      if (!adminSecret) {
        setRefreshing(false);
        return;
      }

      const response = await fetch('/api/cron/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret: adminSecret }),
      });

      if (response.ok) {
        alert('Refresh started! Data will update shortly.');
        // Refetch data after a delay
        setTimeout(() => {
          fetchData();
        }, 5000);
      } else {
        alert('Refresh failed. Check console for details.');
      }
    } catch (error) {
      console.error('Error refreshing:', error);
      alert('Error refreshing data');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <p className="text-gray-400">Loading stats...</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-spotify-dark to-spotify-gray">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-transparent">
              <img
                src="/ChartGuru_logo.jpeg"
                alt="ChartGuru"
                className="h-auto max-h-40 w-auto"
                style={{ background: 'transparent' }}
              />
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">
                Last updated: <span className="text-white">{formatDate(lastUpdated)}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="mt-2 px-4 py-2 bg-spotify-green text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {refreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm">Total Artists</div>
            <div className="text-3xl font-bold text-white mt-2">{artists.length}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm">Total Tracks</div>
            <div className="text-3xl font-bold text-white mt-2">{tracks.length}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm">Top 10 Total Listeners</div>
            <div className="text-3xl font-bold text-white mt-2">
              {formatNumber(artists.slice(0, 10).reduce((sum: number, a: ArtistStat) => sum + a.monthlyListeners, 0))}
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="text-gray-400 text-sm">Biggest Daily Gainer</div>
            <div className="text-lg font-bold text-green-500 mt-2">
              {dailyMovers.length > 0 && dailyMovers[0]?.listenersDelta && dailyMovers[0].listenersDelta > 0
                ? `${dailyMovers[0].name} (+${formatNumber(dailyMovers[0].listenersDelta)})`
                : '—'}
            </div>
          </div>
        </div>

        {/* Global Artists Section - Side by Side */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Global Top Artists Overview</h2>
          <ArtistTableSideBySide monthlyArtists={artists} dailyMovers={dailyMovers} />
        </section>

        {/* Global Tracks Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Global Top 100 Tracks by Daily Streams</h2>
          <TrackTable tracks={tracks} />
        </section>

        {/* Netherlands Artists Section - Side by Side */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-xl">🇳🇱</span>
            Netherlands Top Artists Overview
          </h2>
          <ArtistTableSideBySide monthlyArtists={nlArtists} dailyMovers={nlDailyMovers} />
        </section>

        {/* Netherlands Tracks Section */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-xl">🇳🇱</span>
            Netherlands Top 100 Tracks by Daily Streams
          </h2>
          <TrackTable tracks={nlTracks} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>Spotify Stats Dashboard • Data refreshed twice daily at 00:00 and 12:00 UTC</p>
        </div>
      </footer>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

