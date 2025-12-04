import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Force dynamic rendering since we query the database
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the most recent update time from either artists or tracks
    const [latestArtist, latestTrack] = await Promise.all([
      prisma.artistCurrent.findFirst({
        orderBy: { lastUpdated: 'desc' },
        select: { lastUpdated: true },
      }),
      prisma.trackCurrent.findFirst({
        orderBy: { lastUpdated: 'desc' },
        select: { lastUpdated: true },
      }),
    ]);
    
    const lastUpdated = latestArtist?.lastUpdated || latestTrack?.lastUpdated || null;
    
    return NextResponse.json({ 
      lastUpdated: lastUpdated?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error fetching last updated:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let userFriendlyMessage = 'Failed to fetch last updated';
    if (errorMessage.includes('P1001') || errorMessage.includes('Can\'t reach database')) {
      userFriendlyMessage = 'Database connection failed. Please check DATABASE_URL environment variable.';
    } else if (errorMessage.includes('table') && errorMessage.includes('does not exist')) {
      userFriendlyMessage = 'Database tables do not exist. Please initialize the database.';
    }
    
    return NextResponse.json(
      { 
        error: userFriendlyMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

