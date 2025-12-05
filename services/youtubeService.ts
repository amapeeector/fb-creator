
import { Creator } from "../types";
import { formatSubscriberCount } from "../utils/formatUtils";

interface YouTubeSearchResult {
  id: { channelId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: { default: { url: string }, high: { url: string } };
    channelTitle: string;
  };
}

interface ChannelStatistics {
  id: string;
  statistics: {
    subscriberCount: string;
    videoCount: string;
    viewCount: string;
  };
  snippet: {
    customUrl?: string;
    title: string;
    description: string;
    thumbnails: { medium: { url: string } };
  };
}

async function fetchWithRotation(urls: (key: string) => string, keys: string[]): Promise<any> {
  let lastError: any;

  for (const key of keys) {
    if (!key.trim()) continue;
    const url = urls(key.trim());
    
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        if (data.error.code === 403 || data.error.code === 429) {
           console.warn(`Key ${key.slice(0,5)}... exhausted. Rotating.`);
           lastError = data.error;
           continue; 
        }
        throw new Error(data.error.message);
      }

      return data; 
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  
  throw new Error(`All API keys exhausted. Last error: ${lastError?.message || 'Unknown'}`);
}

export async function searchYouTubeAPI(
  apiKeys: string[],
  query: string,
  maxResults: number = 50
): Promise<Partial<Creator>[]> {
  const BASE_URL = "https://www.googleapis.com/youtube/v3";

  if (!apiKeys || apiKeys.length === 0) {
    throw new Error("No YouTube API Keys provided.");
  }

  try {
    // 1. Search for Channels
    const searchData = await fetchWithRotation(
      (key) => `${BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=${maxResults}&key=${key}`,
      apiKeys
    );

    const items = searchData.items as YouTubeSearchResult[];
    if (!items || items.length === 0) return [];

    // 2. Get Statistics
    const channelIds = items.map(item => item.id.channelId).join(',');
    const statsData = await fetchWithRotation(
      (key) => `${BASE_URL}/channels?part=snippet,statistics&id=${channelIds}&key=${key}`,
      apiKeys
    );

    const channels = statsData.items as ChannelStatistics[];

    // 3. Map Data
    return channels.map(ch => {
        const rawSubs = parseInt(ch.statistics.subscriberCount || '0');
        const fmtSubs = formatSubscriberCount(rawSubs);

        return {
            name: ch.snippet.title,
            youtubeHandle: ch.snippet.customUrl ? ch.snippet.customUrl.replace('@', '') : ch.snippet.title.replace(/\s+/g, ''),
            youtubeSubs: fmtSubs,
            profileImage: ch.snippet.thumbnails.medium?.url,
            niche: query,
            tiktokStatus: undefined, 
            opportunityScore: 0
        };
    });

  } catch (error) {
    console.error("YouTube API Error:", error);
    throw error;
  }
}
