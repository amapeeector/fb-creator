
export enum TikTokStatus {
  NOT_FOUND = 'NOT_FOUND',
  LOW_PRESENCE = 'LOW_PRESENCE',
  ACTIVE = 'ACTIVE',
}

export enum Platform {
  TIKTOK = 'TikTok',
  FACEBOOK = 'Facebook'
}

export enum SearchSource {
  YOUTUBE_DB = 'YouTube Database (AI Index)',
  WEB_SEARCH = 'Google Web Search',
  YOUTUBE_API = 'YouTube Data API (Direct)',
}

export interface Creator {
  name: string;
  niche: string;
  youtubeSubs: string;
  youtubeHandle: string;
  profileImage?: string;
  
  // TikTok
  tiktokStatus: TikTokStatus;
  tiktokHandle?: string;
  
  // Facebook
  facebookStatus?: TikTokStatus; // Reusing enum for consistency
  facebookHandle?: string;
  facebookFollowers?: string;
  facebookConfidence?: number; // Added for Facebook Research Engineer logic

  opportunityScore: number;
  analysis: string;
  source?: SearchSource;
  addedAt?: string;
}

export interface SearchParams {
  niche: string;
  minSubs: string;
  maxSubs: string; // Added Max Subs
  avgViews: string;
  resultCount: number;
  contentTypes: string[];
  channelStyle: string;
  targetStatus: TikTokStatus[];
  targetPlatform: Platform; // Added Target Platform
  searchSource: SearchSource;
}

export interface SearchHistoryItem {
  id: string;
  timestamp: number;
  params: SearchParams;
  resultSummary: string;
}

export interface AppSettings {
  googleSheetUrl?: string;
  youtubeApiKeys?: string[];
  hasPromptedLocalSave: boolean;
  storageConfigured: boolean;
}

export enum SortOption {
  OPPORTUNITY = 'Opportunity Score',
  SUBS = 'Subscribers',
}
