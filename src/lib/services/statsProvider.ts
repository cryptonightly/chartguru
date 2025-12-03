import { prisma } from '../db';
import { scrapeKworbTopArtistsByListeners } from '../scraping/kworbArtists';
import { scrapeKworbGlobalDailyTracks } from '../scraping/kworbTracks';
import { scrapeKworbNetherlandsArtists, scrapeKworbNetherlandsDailyTracks } from '../scraping/kworbNetherlands';
import { resolveArtistMetadata, resolveTrackMetadata } from '../spotify/metadata';
import { ArtistStat, TrackStat } from '../types';

export interface SpotifyStatsProvider {
  refreshAllStats(): Promise<void>;
  getTopArtists(limit: number, country?: string): Promise<ArtistStat[]>;
  getTopTracks(limit: number, country?: string): Promise<TrackStat[]>;
}

class SpotifyStatsProviderImpl implements SpotifyStatsProvider {
  /**
   * Refreshes all stats by scraping kworb, storing snapshots, computing deltas, and enriching with Spotify metadata
   */
  async refreshAllStats(): Promise<void> {
    console.log('Starting stats refresh...');
    
    try {
      // Step 1: Scrape global kworb charts
      console.log('Scraping global kworb artists...');
      const artistRaws = await scrapeKworbTopArtistsByListeners();
      console.log(`Scraped ${artistRaws.length} global artists`);
      
      console.log('Scraping global kworb tracks...');
      const trackRaws = await scrapeKworbGlobalDailyTracks();
      console.log(`Scraped ${trackRaws.length} global tracks`);
      
      // Step 2: Clean up invalid track entries (tracks with suspiciously small daily streams or invalid names)
      await this.cleanupInvalidTracks('global');
      
      // Step 3: Store global snapshots
      await this.storeArtistSnapshots(artistRaws, 'global');
      await this.storeTrackSnapshots(trackRaws, 'global');
      
      // Step 4: Update global current stats with rank deltas
      await this.updateArtistCurrents(artistRaws, 'global');
      await this.updateTrackCurrents(trackRaws, 'global');
      
      // Step 4: Scrape Netherlands data
      console.log('Scraping Netherlands artists...');
      const nlArtistRaws = await scrapeKworbNetherlandsArtists();
      console.log(`Scraped ${nlArtistRaws.length} Netherlands artists`);
      
      console.log('Scraping Netherlands tracks...');
      const nlTrackRaws = await scrapeKworbNetherlandsDailyTracks();
      console.log(`Scraped ${nlTrackRaws.length} Netherlands tracks`);
      
      // Step 6: Clean up invalid track entries for Netherlands
      await this.cleanupInvalidTracks('nl');
      
      // Step 7: Store Netherlands snapshots
      await this.storeArtistSnapshots(nlArtistRaws, 'nl');
      await this.storeTrackSnapshots(nlTrackRaws, 'nl');
      
      // Step 8: Update Netherlands current stats
      await this.updateArtistCurrents(nlArtistRaws, 'nl');
      await this.updateTrackCurrents(nlTrackRaws, 'nl');
      
      console.log('Stats refresh completed successfully');
    } catch (error) {
      console.error('Error refreshing stats:', error);
      throw error;
    }
  }

  /**
   * Stores artist snapshots in the database
   */
  private async storeArtistSnapshots(artists: Array<{ name: string; rank: number; monthlyListeners: number; listenersDelta?: number }>, country: string = 'global'): Promise<void> {
    await prisma.artistSnapshot.createMany({
      data: artists.map(a => ({
        artistName: a.name,
        country,
        rank: a.rank,
        monthlyListeners: a.monthlyListeners,
        listenersDelta: a.listenersDelta ?? null,
      })),
    });
  }

  /**
   * Stores track snapshots in the database
   */
  private async storeTrackSnapshots(tracks: Array<{ trackName: string; artistName: string; rank: number; dailyStreams: number; totalStreams?: number }>, country: string = 'global'): Promise<void> {
    await prisma.trackSnapshot.createMany({
      data: tracks.map(t => ({
        trackName: t.trackName,
        artistName: t.artistName,
        country,
        rank: t.rank,
        dailyStreams: BigInt(t.dailyStreams),
        totalStreams: t.totalStreams ? BigInt(t.totalStreams) : null,
      })),
    });
  }

  /**
   * Updates artist current stats, computing rank deltas and enriching with Spotify metadata
   */
  private async updateArtistCurrents(artists: Array<{ name: string; rank: number; monthlyListeners: number; listenersDelta?: number }>, country: string = 'global'): Promise<void> {
    for (const artist of artists) {
      // Get previous rank from last snapshot
      const previousSnapshot = await prisma.artistSnapshot.findFirst({
        where: {
          artistName: artist.name,
          country,
          createdAt: {
            lt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const previousRank = previousSnapshot?.rank ?? null;
      const rankDelta = previousRank !== null ? previousRank - artist.rank : null;

      // Calculate listenersDelta if not provided (for Netherlands, compare with previous snapshot)
      let listenersDelta = artist.listenersDelta;
      if (listenersDelta === undefined && previousSnapshot) {
        // Calculate delta from previous snapshot's monthlyListeners
        listenersDelta = artist.monthlyListeners - previousSnapshot.monthlyListeners;
      }

      // Get existing current record to check if we need to enrich metadata
      const existing = await prisma.artistCurrent.findUnique({
        where: { artistName_country: { artistName: artist.name, country } },
      });

      let artistId = existing?.artistId ?? null;
      let imageUrl = existing?.imageUrl ?? null;
      let genres = existing?.genres ?? null;
      let spotifyUrl = existing?.spotifyUrl ?? null;

      // Enrich with Spotify metadata if not already done
      if (!artistId) {
        console.log(`Enriching metadata for artist: ${artist.name}`);
        const metadata = await resolveArtistMetadata(artist.name);
        if (metadata) {
          artistId = metadata.spotifyId;
          imageUrl = metadata.imageUrl ?? null;
          genres = metadata.genres ? JSON.stringify(metadata.genres) : null;
          spotifyUrl = metadata.url ?? null;
        }
        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upsert current record
      await prisma.artistCurrent.upsert({
        where: { artistName_country: { artistName: artist.name, country } },
        update: {
          rank: artist.rank,
          previousRank,
          rankDelta,
          monthlyListeners: artist.monthlyListeners,
          listenersDelta: listenersDelta ?? null,
          artistId: artistId ?? undefined,
          imageUrl: imageUrl ?? undefined,
          genres: genres ?? undefined,
          spotifyUrl: spotifyUrl ?? undefined,
          lastUpdated: new Date(),
        },
        create: {
          artistName: artist.name,
          country,
          rank: artist.rank,
          previousRank,
          rankDelta,
          monthlyListeners: artist.monthlyListeners,
          listenersDelta: listenersDelta ?? null,
          artistId: artistId ?? null,
          imageUrl: imageUrl ?? null,
          genres: genres ?? null,
          spotifyUrl: spotifyUrl ?? null,
        },
      });
    }
  }

  /**
   * Updates track current stats, computing rank deltas and enriching with Spotify metadata
   */
  private async updateTrackCurrents(tracks: Array<{ trackName: string; artistName: string; rank: number; dailyStreams: number; totalStreams?: number }>, country: string = 'global'): Promise<void> {
    for (const track of tracks) {
      // Get previous rank from last snapshot
      const previousSnapshot = await prisma.trackSnapshot.findFirst({
        where: {
          trackName: track.trackName,
          artistName: track.artistName,
          country,
          createdAt: {
            lt: new Date(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const previousRank = previousSnapshot?.rank ?? null;
      const rankDelta = previousRank !== null ? previousRank - track.rank : null;

      // Get existing current record to check if we need to enrich metadata
      const existing = await prisma.trackCurrent.findUnique({
        where: {
          trackName_artistName_country: {
            trackName: track.trackName,
            artistName: track.artistName,
            country,
          },
        },
      });

      let trackId = existing?.trackId ?? null;
      let imageUrl = existing?.imageUrl ?? null;
      let previewUrl = existing?.previewUrl ?? null;
      let spotifyUrl = existing?.spotifyUrl ?? null;

      // Enrich with Spotify metadata if not already done
      if (!trackId) {
        console.log(`Enriching metadata for track: ${track.trackName} by ${track.artistName}`);
        const metadata = await resolveTrackMetadata(track.trackName, track.artistName);
        if (metadata) {
          trackId = metadata.spotifyId;
          imageUrl = metadata.imageUrl ?? null;
          previewUrl = metadata.previewUrl ?? null;
          spotifyUrl = metadata.url ?? null;
        }
        // Add a small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Upsert current record
      await prisma.trackCurrent.upsert({
        where: {
          trackName_artistName_country: {
            trackName: track.trackName,
            artistName: track.artistName,
            country,
          },
        },
        update: {
          rank: track.rank,
          previousRank,
          rankDelta,
          dailyStreams: BigInt(track.dailyStreams),
          totalStreams: track.totalStreams ? BigInt(track.totalStreams) : null,
          trackId: trackId ?? undefined,
          imageUrl: imageUrl ?? undefined,
          previewUrl: previewUrl ?? undefined,
          spotifyUrl: spotifyUrl ?? undefined,
          lastUpdated: new Date(),
        },
        create: {
          trackName: track.trackName,
          artistName: track.artistName,
          country,
          rank: track.rank,
          previousRank,
          rankDelta,
          dailyStreams: BigInt(track.dailyStreams),
          totalStreams: track.totalStreams ? BigInt(track.totalStreams) : null,
          trackId: trackId ?? null,
          imageUrl: imageUrl ?? null,
          previewUrl: previewUrl ?? null,
          spotifyUrl: spotifyUrl ?? null,
        },
      });
    }
  }

  /**
   * Gets top artists from the database
   */
  async getTopArtists(limit: number = 500, country: string = 'global'): Promise<ArtistStat[]> {
    const artists = await prisma.artistCurrent.findMany({
      where: { country },
      orderBy: { rank: 'asc' },
      take: limit,
    });

    return artists.map(a => ({
      artistId: a.artistId,
      name: a.artistName,
      rank: a.rank,
      previousRank: a.previousRank,
      rankDelta: a.rankDelta,
      monthlyListeners: a.monthlyListeners,
      listenersDelta: a.listenersDelta,
      imageUrl: a.imageUrl ?? undefined,
      genres: a.genres ? JSON.parse(a.genres) : undefined,
      spotifyUrl: a.spotifyUrl ?? undefined,
      lastUpdated: a.lastUpdated,
    }));
  }

  /**
   * Cleans up invalid track entries from the database
   * Removes tracks with suspiciously small daily streams or invalid names
   */
  private async cleanupInvalidTracks(country: string = 'global'): Promise<void> {
    console.log(`Cleaning up invalid tracks for ${country}...`);
    
    // Find and delete tracks with suspiciously small daily streams (< 100,000)
    // These are likely invalid entries from previous scrapes
    const invalidTracks = await prisma.trackCurrent.findMany({
      where: {
        country,
        dailyStreams: {
          lt: BigInt(100000),
        },
      },
    });
    
    if (invalidTracks.length > 0) {
      console.log(`Found ${invalidTracks.length} tracks with suspiciously small daily streams`);
      
      // Delete from TrackCurrent
      await prisma.trackCurrent.deleteMany({
        where: {
          country,
          dailyStreams: {
            lt: BigInt(100000),
          },
        },
      });
      
      // Also delete corresponding snapshots
      for (const track of invalidTracks) {
        await prisma.trackSnapshot.deleteMany({
          where: {
            trackName: track.trackName,
            artistName: track.artistName,
            country,
          },
        });
      }
    }
    
    // Find and delete tracks with invalid names (just symbols like "=", "+", "-", etc.)
    const allTracks = await prisma.trackCurrent.findMany({
      where: { country },
    });
    
    const tracksToDelete = allTracks.filter(track => {
      const trackName = track.trackName.trim();
      // Skip if track name is just symbols or too short
      return (
        trackName.length < 2 ||
        /^[=\+\-\s]+$/.test(trackName) ||
        /^[\d\s\-=]+$/.test(trackName) ||
        !/[a-zA-Z]/.test(trackName)
      );
    });
    
    if (tracksToDelete.length > 0) {
      console.log(`Found ${tracksToDelete.length} tracks with invalid names`);
      
      for (const track of tracksToDelete) {
        // Delete from TrackCurrent
        await prisma.trackCurrent.deleteMany({
          where: {
            trackName: track.trackName,
            artistName: track.artistName,
            country,
          },
        });
        
        // Delete from TrackSnapshot
        await prisma.trackSnapshot.deleteMany({
          where: {
            trackName: track.trackName,
            artistName: track.artistName,
            country,
          },
        });
      }
    }
    
    console.log(`Cleanup completed for ${country}`);
  }

  /**
   * Gets top tracks from the database
   */
  async getTopTracks(limit: number = 100, country: string = 'global'): Promise<TrackStat[]> {
    const tracks = await prisma.trackCurrent.findMany({
      where: { country },
      orderBy: { rank: 'asc' },
      take: limit,
    });

    return tracks.map(t => ({
      trackId: t.trackId,
      name: t.trackName,
      mainArtistName: t.artistName,
      rank: t.rank,
      previousRank: t.previousRank,
      rankDelta: t.rankDelta,
      dailyStreams: Number(t.dailyStreams),
      totalStreams: t.totalStreams ? Number(t.totalStreams) : undefined,
      imageUrl: t.imageUrl ?? undefined,
      previewUrl: t.previewUrl ?? undefined,
      spotifyUrl: t.spotifyUrl ?? undefined,
      lastUpdated: t.lastUpdated,
    }));
  }
}

export const statsProvider: SpotifyStatsProvider = new SpotifyStatsProviderImpl();

