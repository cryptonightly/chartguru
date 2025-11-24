'use client';

import { useState, useMemo } from 'react';
import { ArtistStat } from '@/lib/types';
import Image from 'next/image';

interface ArtistTableProps {
  artists: ArtistStat[];
}

type SortField = 'rank' | 'name' | 'monthlyListeners' | 'rankDelta';
type SortDirection = 'asc' | 'desc';

export default function ArtistTable({ artists }: ArtistTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Filter and sort artists
  const filteredAndSorted = useMemo(() => {
    let filtered = artists.filter(artist =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortField) {
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
        case 'rankDelta':
          aVal = a.rankDelta ?? 0;
          bVal = b.rankDelta ?? 0;
          break;
        default:
          return 0;
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [artists, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const topArtists = filteredAndSorted.slice(0, 20);
  const remainingArtists = filteredAndSorted.slice(20);

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spotify-green"
        />
      </div>

      {/* Top Artists Highlight */}
      {!searchQuery && (
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-4">Top Artists</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topArtists.slice(0, 8).map((artist) => (
              <div
                key={artist.artistId || artist.name}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {artist.imageUrl ? (
                    <Image
                      src={artist.imageUrl}
                      alt={artist.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-[60px] h-[60px] bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{artist.name}</div>
                    <div className="text-sm text-gray-400">
                      #{artist.rank} • {formatNumber(artist.monthlyListeners)} listeners
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Table */}
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => handleSort('rank')}
                >
                  Rank {sortField === 'rank' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">Artist</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => handleSort('monthlyListeners')}
                >
                  Monthly Listeners {sortField === 'monthlyListeners' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => handleSort('rankDelta')}
                >
                  Change {sortField === 'rankDelta' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">Genres</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((artist) => (
                <tr
                  key={artist.artistId || artist.name}
                  className="border-t border-gray-800 hover:bg-gray-800 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold">#{artist.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {artist.imageUrl && (
                        <Image
                          src={artist.imageUrl}
                          alt={artist.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      )}
                      <div>
                        <div className="font-medium">{artist.name}</div>
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
                    {getRankChangeIcon(artist.rankDelta)}
                  </td>
                  <td className="px-4 py-3">
                    {artist.genres && artist.genres.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {artist.genres.slice(0, 2).map((genre, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-700 rounded text-xs"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

