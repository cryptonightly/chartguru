import { NextResponse } from 'next/server';
import { statsProvider } from '@/lib/services/statsProvider';

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const country = searchParams.get('country') || 'global';
    
    const tracks = await statsProvider.getTopTracks(limit, country);
    
    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Error fetching tracks:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let userFriendlyMessage = 'Failed to fetch tracks';
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

