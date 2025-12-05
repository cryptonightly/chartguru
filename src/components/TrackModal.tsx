'use client';

import { TrackStat } from '@/lib/types';
import Image from 'next/image';
import { X } from 'lucide-react';
import TrackHistoryChart from './TrackHistoryChart';

interface TrackModalProps {
  track: TrackStat | null;
  onClose: () => void;
}

export default function TrackModal({ track, onClose }: TrackModalProps) {
  if (!track) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4" onClick={onClose}>
      <div 
        className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            {track.imageUrl && (
              <Image
                src={track.imageUrl}
                alt={track.name}
                width={120}
                height={120}
                className="rounded"
              />
            )}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{track.name}</h2>
              <div className="text-gray-400 text-lg mb-1">{track.mainArtistName}</div>
              <div className="text-gray-500 text-sm">
                Rank #{track.rank}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-400 text-sm mb-1">Daily Streams</div>
              <div className="text-2xl font-bold text-spotify-green">
                {formatNumber(track.dailyStreams)}
              </div>
            </div>
            {track.totalStreams && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Total Streams</div>
                <div className="text-2xl font-bold text-white">
                  {formatNumber(track.totalStreams)}
                </div>
              </div>
            )}
            {track.rankDelta !== null && track.rankDelta !== undefined && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-gray-400 text-sm mb-1">Rank Change</div>
                <div className={`text-2xl font-bold ${
                  track.rankDelta < 0 ? 'text-green-500' : track.rankDelta > 0 ? 'text-red-500' : 'text-gray-400'
                }`}>
                  {track.rankDelta < 0 ? '↑' : track.rankDelta > 0 ? '↓' : '−'} 
                  {Math.abs(track.rankDelta)}
                </div>
              </div>
            )}
          </div>

          {/* Spotify/Preview Links */}
          <div className="flex gap-4 mb-8">
            {track.spotifyUrl && (
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Open on Spotify
              </a>
            )}
            {track.previewUrl && (
              <a
                href={track.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Play Preview
              </a>
            )}
          </div>

          {/* Historical Trends */}
          <div className="pt-6 border-t border-gray-800">
            <h3 className="text-xl font-bold text-white mb-4">Historical Trends</h3>
            <TrackHistoryChart 
              trackName={track.name}
              artistName={track.mainArtistName}
              country="global"
              days={30}
            />
          </div>
        </div>
      </div>
    </div>
  );
}