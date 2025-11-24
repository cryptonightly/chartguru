import { NextResponse } from 'next/server';
import { scrapeKworbArtistTopSongs, scrapeKworbArtistTopVideos } from '@/lib/scraping/kworbArtistDetails';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ artistId: string }> | { artistId: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const artistId = resolvedParams.artistId;
    
    // Get artist from database - try global first, then any country
    let artist = await prisma.artistCurrent.findFirst({
      where: {
        OR: [
          { artistId: artistId, country: 'global' },
          { artistName: decodeURIComponent(artistId), country: 'global' },
        ],
      },
    });
    
    // If not found in global, try any country
    if (!artist) {
      artist = await prisma.artistCurrent.findFirst({
        where: {
          OR: [
            { artistId: artistId },
            { artistName: decodeURIComponent(artistId) },
          ],
        },
      });
    }
    
    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }
    
    // Scrape top songs if we have a Spotify ID
    let topSongs = null;
    if (artist.artistId) {
      topSongs = await scrapeKworbArtistTopSongs(artist.artistId);
    }
    
    // Scrape top YouTube videos using artist name
    const topVideos = await scrapeKworbArtistTopVideos(artist.artistName);
    
    return NextResponse.json({
      artist: {
        name: artist.artistName,
        artistId: artist.artistId,
        imageUrl: artist.imageUrl,
        spotifyUrl: artist.spotifyUrl,
        genres: artist.genres ? JSON.parse(artist.genres) : null,
        monthlyListeners: artist.monthlyListeners,
        rank: artist.rank,
      },
      topSongs: topSongs?.topSongs || [],
      topVideos: topVideos || [],
    });
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist details' },
      { status: 500 }
    );
  }
}

