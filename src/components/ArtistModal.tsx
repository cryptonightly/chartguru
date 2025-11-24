'use client';

import { useEffect, useState } from 'react';
import { ArtistStat } from '@/lib/types';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ArtistTopSong {
  trackName: string;
  totalStreams: number;
  dailyStreams: number;
  spotifyUrl?: string;
}

interface ArtistTopVideo {
  videoTitle: string;
  totalViews: number;
  yesterdayViews: number;
  youtubeUrl?: string;
}

interface ArtistModalProps {
  artist: ArtistStat | null;
  onClose: () => void;
}

export default function ArtistModal({ artist, onClose }: ArtistModalProps) {
  const [topSongs, setTopSongs] = useState<ArtistTopSong[]>([]);
  const [topVideos, setTopVideos] = useState<ArtistTopVideo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!artist) return;

    const fetchArtistDetails = async () => {
      setLoading(true);
      try {
        // Try by artistId first, then fallback to name
        const identifier = artist.artistId || encodeURIComponent(artist.name);
        const response = await fetch(`/api/stats/artist/${identifier}`);
        
        if (response.ok) {
          const data = await response.json();
          setTopSongs(data.topSongs || []);
          setTopVideos(data.topVideos || []);
        }
      } catch (error) {
        console.error('Error fetching artist details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [artist]);

  if (!artist) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toFixed(2);
  };

  const formatStreams = (streams: number) => {
    // streams is in millions (e.g., 123752.8 = 123.7528 billion)
    if (streams >= 1000) {
      return `${(streams / 1000).toFixed(1)}B`;
    }
    if (streams >= 1) {
      return `${streams.toFixed(1)}M`;
    }
    // For very small numbers, show in thousands
    return `${(streams * 1000).toFixed(0)}K`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed(1)}B`;
    }
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
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
            {artist.imageUrl && (
              <Image
                src={artist.imageUrl}
                alt={artist.name}
                width={120}
                height={120}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{artist.name}</h2>
              <div className="text-gray-400 text-sm">
                Rank #{artist.rank} • {formatNumber(artist.monthlyListeners)} monthly listeners
              </div>
              {artist.genres && artist.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {artist.genres.slice(0, 3).map((genre, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}
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
          {/* Spotify Link */}
          {artist.spotifyUrl && (
            <div className="mb-6">
              <a
                href={artist.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-spotify-green text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Open on Spotify
              </a>
            </div>
          )}

          {/* Top Songs */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-white mb-4">Top 3 Spotify Songs</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-spotify-green mx-auto mb-2"></div>
                <p className="text-gray-400">Loading top songs...</p>
              </div>
            ) : topSongs.length > 0 ? (
              <div className="space-y-3">
                {topSongs.map((song, index) => (
                  <a
                    key={index}
                    href={song.spotifyUrl || '#'}
                    target={song.spotifyUrl ? '_blank' : undefined}
                    rel={song.spotifyUrl ? 'noopener noreferrer' : undefined}
                    className={`block bg-gray-800 rounded-lg p-4 border border-gray-700 transition-colors ${
                      song.spotifyUrl ? 'hover:bg-gray-750 hover:border-spotify-green cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-gray-500 w-8">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold text-white mb-1">
                              {song.trackName}
                            </div>
                            {song.spotifyUrl && (
                              <svg className="w-4 h-4 text-spotify-green" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.84-.66 0-.359.24-.66.54-.779 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.242 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span>Total: {formatStreams(song.totalStreams)} streams</span>
                            <span>Daily: {formatStreams(song.dailyStreams)} streams</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No top songs data available</p>
              </div>
            )}
          </div>

          {/* Top YouTube Videos */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Top 3 YouTube Videos
            </h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-2"></div>
                <p className="text-gray-400">Loading top videos...</p>
              </div>
            ) : topVideos.length > 0 ? (
              <div className="space-y-3">
                {topVideos.map((video, index) => (
                  <a
                    key={index}
                    href={video.youtubeUrl || '#'}
                    target={video.youtubeUrl ? '_blank' : undefined}
                    rel={video.youtubeUrl ? 'noopener noreferrer' : undefined}
                    className={`block bg-gray-800 rounded-lg p-4 border border-gray-700 transition-colors ${
                      video.youtubeUrl ? 'hover:bg-gray-750 hover:border-red-500 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-2xl font-bold text-gray-500 w-8">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-lg font-semibold text-white mb-1">
                              {video.videoTitle}
                            </div>
                            {video.youtubeUrl && (
                              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            )}
                          </div>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span>Total: {formatViews(video.totalViews)} views</span>
                            <span>Yesterday: {formatViews(video.yesterdayViews)} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>No top videos data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

