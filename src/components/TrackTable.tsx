'use client';

import { useState, useMemo } from 'react';
import { TrackStat } from '@/lib/types';
import Image from 'next/image';
import TrackModal from './TrackModal';

interface TrackTableProps {
  tracks: TrackStat[];
}

type SortField = 'rank' | 'name' | 'dailyStreams' | 'rankDelta';
type SortDirection = 'asc' | 'desc';

export default function TrackTable({ tracks }: TrackTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedTrack, setSelectedTrack] = useState<TrackStat | null>(null);

  // Filter and sort tracks
  const filteredAndSorted = useMemo(() => {
    let filtered = tracks.filter(
      track =>
        track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.mainArtistName.toLowerCase().includes(searchQuery.toLowerCase())
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
        case 'dailyStreams':
          aVal = a.dailyStreams;
          bVal = b.dailyStreams;
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
  }, [tracks, searchQuery, sortField, sortDirection]);

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

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tracks or artists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-spotify-green"
        />
      </div>

      <div className="bg-gray-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-800 sticky top-0 z-10">
              <tr>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => handleSort('rank')}
                >
                  Rank {sortField === 'rank' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">Track</th>
                <th className="px-4 py-3 text-left">Artist</th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => handleSort('dailyStreams')}
                >
                  Daily Streams {sortField === 'dailyStreams' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700"
                  onClick={() => handleSort('rankDelta')}
                >
                  Change {sortField === 'rankDelta' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left">Preview</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.map((track) => (
                <tr
                  key={track.trackId || `${track.name}-${track.mainArtistName}`}
                  className="border-t border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => setSelectedTrack(track)}
                >
                  <td className="px-4 py-3 font-semibold">#{track.rank}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {track.imageUrl && (
                        <Image
                          src={track.imageUrl}
                          alt={track.name}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{track.name}</div>
                        {track.previousRank && (
                          <div className="text-xs text-gray-500">
                            Previous: #{track.previousRank}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{track.mainArtistName}</td>
                  <td className="px-4 py-3">{formatNumber(track.dailyStreams)}</td>
                  <td className="px-4 py-3">
                    {getRankChangeIcon(track.rankDelta)}
                  </td>
                  <td className="px-4 py-3">
                    {track.previewUrl ? (
                      <audio controls className="h-8">
                        <source src={track.previewUrl} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
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

      {/* Track Modal */}
      <TrackModal
        track={selectedTrack}
        onClose={() => setSelectedTrack(null)}
      />
    </div>
  );
}

