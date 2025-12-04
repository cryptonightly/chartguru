import { NextResponse } from 'next/server';
import { statsProvider } from '@/lib/services/statsProvider';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '500', 10);
    const sortBy = searchParams.get('sortBy') || 'rank'; // 'rank' or 'dailyChange'
    const country = searchParams.get('country') || 'global';
    
    let artists = await statsProvider.getTopArtists(limit, country);
    
    // If sorting by daily change, sort by listenersDelta
    if (sortBy === 'dailyChange') {
      artists = artists
        .filter(a => a.listenersDelta !== null)
        .sort((a, b) => {
          const aDelta = Math.abs(a.listenersDelta ?? 0);
          const bDelta = Math.abs(b.listenersDelta ?? 0);
          return bDelta - aDelta; // Descending by absolute change
        })
        .slice(0, limit);
    }
    
    return NextResponse.json({ artists });
  } catch (error) {
    console.error('Error fetching artists:', error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Check for common database errors
    let userFriendlyMessage = 'Failed to fetch artists';
    if (errorMessage.includes('P1001') || errorMessage.includes('Can\'t reach database')) {
      userFriendlyMessage = 'Database connection failed. Please check DATABASE_URL environment variable.';
    } else if (errorMessage.includes('P2025') || errorMessage.includes('Record to update not found')) {
      userFriendlyMessage = 'Database tables may not be initialized. Please run: npx prisma db push';
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

