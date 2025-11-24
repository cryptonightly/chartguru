import 'server-only';
import * as cheerio from 'cheerio';
import { TrackStatRaw } from '../types';

/**
 * Scrapes kworb.net for global daily Spotify chart
 * URL: https://kworb.net/spotify/country/global_daily.html
 */
export async function scrapeKworbGlobalDailyTracks(): Promise<TrackStatRaw[]> {
  try {
    // Use Node's native fetch to avoid axios/undici issues
    const response = await fetch('https://kworb.net/spotify/country/global_daily.html', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);
    const tracks: TrackStatRaw[] = [];
    
    // Find the main table with id="spotifydaily" - structure: Pos, P+, Artist and Title, Days, Pk, (x?), Streams, Streams+, 7Day, 7Day+, Total
    $('table#spotifydaily tr, table.sortable tr').each((index, element) => {
      // Skip header row
      if (index === 0) return;
      
      const $row = $(element);
      const cells = $row.find('td');
      
      if (cells.length >= 7) {
        // Extract rank (first column, index 0)
        const rankText = $(cells[0]).text().trim();
        const rank = parseInt(rankText.replace(/[^\d]/g, ''), 10);
        
        if (isNaN(rank)) return;
        
        // Artist and Title are in the third column (index 2)
        const artistTitleText = $(cells[2]).text().trim();
        const parts = artistTitleText.split(' - ');
        
        let trackName = '';
        let artistName = '';
        
        if (parts.length >= 2) {
          artistName = parts[0].trim();
          trackName = parts[1].trim();
        } else {
          // Fallback if format is different
          trackName = artistTitleText;
          artistName = 'Unknown';
        }
        
        // Column structure (verified from HTML):
        // Index 0: Pos (rank) - e.g., "1"
        // Index 1: P+ (position change) - e.g., "="
        // Index 2: Artist and Title - e.g., "Taylor Swift - The Fate of Ophelia"
        // Index 3: Days (NOT what we want - this is number of days on chart) - e.g., "52"
        // Index 4: Pk (peak position) - e.g., "1"
        // Index 5: (x?) mini text - e.g., "(x51)"
        // Index 6: Streams (THIS IS WHAT WE WANT - daily streams) - e.g., "5,992,905"
        // Index 7: Streams+ (daily change) - e.g., "-994,294"
        // Index 8: 7Day (7-day total) - e.g., "48,313,295"
        // Index 9: 7Day+ (7-day change) - e.g., "-360,813"
        // Index 10: Total (all-time total) - e.g., "514,128,404"
        
        // Daily streams is in the "Streams" column (index 6)
        // This should be a large number with commas (e.g., "5,992,905")
        const streamsText = $(cells[6]).text().trim();
        const dailyStreams = parseNumber(streamsText);
        
        // Validation: Daily streams should be a large number (typically > 100,000)
        // If it's suspiciously small, log a warning but still use it
        if (dailyStreams < 1000) {
          console.warn(`Suspiciously small daily streams value for ${trackName}: ${dailyStreams}. Raw text: "${streamsText}"`);
        }
        
        // Total streams is in the last column (11th column, index 10, if present)
        let totalStreams: number | undefined;
        if (cells.length >= 11) {
          const totalText = $(cells[10]).text().trim();
          totalStreams = parseNumber(totalText) || undefined;
        }
        
        if (!trackName || !artistName) return;
        
        tracks.push({
          trackName,
          artistName,
          rank,
          dailyStreams,
          totalStreams,
        });
      }
    });
    
    // Limit to top 100
    return tracks.slice(0, 100);
  } catch (error) {
    console.error('Error scraping kworb tracks:', error);
    throw new Error(`Failed to scrape kworb tracks: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parses a number string that may contain commas, decimals, or units (M, K)
 */
function parseNumber(text: string): number {
  if (!text) return 0;
  
  // Remove commas and spaces
  let cleaned = text.replace(/[, ]/g, '');
  
  // Handle units (M = million, K = thousand)
  let multiplier = 1;
  if (cleaned.endsWith('M')) {
    multiplier = 1000000;
    cleaned = cleaned.replace('M', '');
  } else if (cleaned.endsWith('K')) {
    multiplier = 1000;
    cleaned = cleaned.replace('K', '');
  }
  
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * multiplier);
}

