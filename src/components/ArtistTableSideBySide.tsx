'use client';

import { useState, useMemo } from 'react';
import { ArtistStat } from '@/lib/types';
import Image from 'next/image';
import ArtistModal from './ArtistModal';

interface ArtistTableSideBySideProps {
  monthlyArtists: ArtistStat[];
  dailyMovers: ArtistStat[];
}

type SortField = 'rank' | 'name' | 'monthlyListeners' | 'listenersDelta' | 'rankDelta';
type SortDirection = 'asc' | 'desc';

export default function ArtistTableSideBySide({ monthlyArtists, dailyMovers }: ArtistTableSideBySideProps) {
  const [monthlySearch, setMonthlySearch] = useState('');
  const [dailySearch, setDailySearch] = useState('');
  const [monthlySort, setMonthlySort] = useState<{ field: SortField; direction: SortDirection }>({ field: 'rank', direction: 'asc' });
  const [dailySort, setDailySort] = useState<{ field: SortField; direction: SortDirection }>({ field: 'listenersDelta', direction: 'desc' });
  const [selectedArtist, setSelectedArtist] = useState<ArtistStat | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getRankChangeIcon = (delta: number | null) => {
    if (delta === null || delta === 0) {
      return <span className="text-gray-500">—</span>;
    }
    if (delta < 0) {
      return <span className="text-green-500">↑ {Math.abs(delta)}</span>;
    }
    return <span className="text-red-500">↓ {delta}</span>;
  };

  const getDailyChangeIcon = (delta: number | null) => {
    if (delta === null || delta === 0) {
      return <span className="text-gray-500">—</span>;
    }
    if (delta > 0) {
      return <span className="text-green-500 font-semibold">+{formatNumber(delta)}</span>;
    }
    return <span className="text-red-500 font-semibold">{formatNumber(delta)}</span>;
  };

  const sortArtists = (artists: ArtistStat[], sort: { field: SortField; direction: SortDirection }) => {
    return [...artists].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sort.field) {
        case 'rank':
          aVal = a.rank;
          bVal = b.rank;
          break;
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'monthlyListeners':
          aVal = a.monthlyListeners;
          bVal = b.monthlyListeners;
          break;
        case 'listenersDelta':
          aVal = a.listenersDelta ?? 0;
          bVal = b.listenersDelta ?? 0;
          break;
        case 'rankDelta':
          aVal = a.rankDelta ?? 0;
          bVal = b.rankDelta ?? 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredMonthly = useMemo(() => {
    const filtered = monthlyArtists.filter(artist =>
      artist.name.toLowerCase().includes(monthlySearch.toLowerCase())
    );
    return sortArtists(filtered, monthlySort);
  }, [monthlyArtists, monthlySearch, monthlySort]);

  const filteredDaily = useMemo(() => {
    const filtered = dailyMovers.filter(artist =>
      artist.name.toLowerCase().includes(dailySearch.toLowerCase())
    );
    return sortArtists(filtered, dailySort);
  }, [dailyMovers, dailySearch, dailySort]);

  const handleMonthlySort = (field: SortField) => {
    setMonthlySort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDailySort = (field: SortField) => {
    setDailySort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleArtistClick = (artist: ArtistStat) => {
    setSelectedArtist(artist);
  };

  const renderTable = (artists: ArtistStat[], search: string, setSearch: (val: string) => void, sort: { field: SortField; direction: SortDirection }, onSort: (field: SortField) => void, isDaily: boolean) => (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder={`Search artists...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spotify-green"
        />
      </div>

      <div className="bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700/50">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <table className="w-full">
            <thead className="bg-gray-800/90 backdrop-blur-sm sticky top-0 z-10">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => onSort('rank')}
                >
                  Rank {sort.field === 'rank' && (sort.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">Artist</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => onSort('monthlyListeners')}
                >
                  {isDaily ? 'Monthly' : 'Monthly'} Listeners {sort.field === 'monthlyListeners' && (sort.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => onSort(isDaily ? 'listenersDelta' : 'rankDelta')}
                >
                  {isDaily ? 'Daily Change' : 'Rank Change'} {sort.field === (isDaily ? 'listenersDelta' : 'rankDelta') && (sort.direction === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist, index) => (
                <tr
                  key={artist.artistId || artist.name}
                  className="border-t border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold">#{isDaily ? index + 1 : artist.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {artist.imageUrl && (
                        <Image
                          src={artist.imageUrl}
                          alt={artist.name}
                          width={40}
                          height={40}
                          className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleArtistClick(artist)}
                        />
                      )}
                      <div>
                        <div 
                          className="font-medium cursor-pointer hover:text-spotify-green transition-colors"
                          onClick={() => handleArtistClick(artist)}
                        >
                          {artist.name}
                        </div>
                        {artist.previousRank && (
                          <div className="text-xs text-gray-500">
                            Previous: #{artist.previousRank}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{formatNumber(artist.monthlyListeners)}</td>
                  <td className="px-4 py-3">
                    {isDaily ? getDailyChangeIcon(artist.listenersDelta) : getRankChangeIcon(artist.rankDelta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Listeners */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="mb-4 pb-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <h3 className="text-xl font-bold text-white">Top Artists by Monthly Listeners</h3>
            </div>
            <p className="text-sm text-gray-400">Ranked by total monthly listeners</p>
          </div>
          {renderTable(filteredMonthly, monthlySearch, setMonthlySearch, monthlySort, handleMonthlySort, false)}
        </div>

        {/* Daily Movers */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
          <div className="mb-4 pb-4 border-b border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="text-xl font-bold text-white">Daily Movers</h3>
            </div>
            <p className="text-sm text-gray-400">Biggest daily changes in monthly listeners</p>
          </div>
          {renderTable(filteredDaily, dailySearch, setDailySearch, dailySort, handleDailySort, true)}
        </div>
      </div>
      
      {/* Artist Modal */}
      <ArtistModal 
        artist={selectedArtist} 
        onClose={() => setSelectedArtist(null)} 
      />
    </>
  );
}

