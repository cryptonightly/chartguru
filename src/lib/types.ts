export interface ArtistStat {
  artistId: string | null;
  name: string;
  rank: number;
  previousRank: number | null;
  rankDelta: number | null; // negative = up in chart
  monthlyListeners: number;
  listenersDelta: number | null;
  imageUrl?: string;
  genres?: string[];
  spotifyUrl?: string;
  lastUpdated: Date;
}

export interface TrackStat {
  trackId: string | null;
  name: string;
  mainArtistName: string;
  rank: number;
  previousRank: number | null;
  rankDelta: number | null; // negative = moved up, positive = moved down
  dailyStreams: number;
  totalStreams?: number | null;
  imageUrl?: string;
  previewUrl?: string | null;
  spotifyUrl?: string;
  lastUpdated: Date;
}

export interface ArtistStatRaw {
  name: string;
  rank: number;
  monthlyListeners: number;
  listenersDelta?: number;
}

export interface TrackStatRaw {
  trackName: string;
  artistName: string;
  rank: number;
  dailyStreams: number;
  totalStreams?: number;
}

// Historical data types for charts
export interface ArtistHistoryDataPoint {
  date: string;
  monthlyListeners: number;
  rank: number;
  listenersDelta: number;
}

export interface TrackHistoryDataPoint {
  date: string;
  dailyStreams: number;
  totalStreams: number | null;
  rank: number;
}

export interface ArtistHistoryResponse {
  artistName: string;
  country: string;
  history: ArtistHistoryDataPoint[];
  dataPoints: number;
}

export interface TrackHistoryResponse {
  trackName: string;
  artistName: string;
  country: string;
  history: TrackHistoryDataPoint[];
  dataPoints: number;
}

