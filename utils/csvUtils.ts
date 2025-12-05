
import { Creator, TikTokStatus } from '../types';

export const generateCSV = (creators: Creator[]): string => {
  // Define Headers - Included Facebook Fields
  const headers = [
    'Name', 
    'YouTube Handle', 
    'Channel Link', 
    'Niche', 
    'Subscribers', 
    'TikTok Status', 
    'TikTok Handle', 
    'Facebook Status',
    'Facebook Handle',
    'Facebook Followers',
    'Facebook Confidence', // Added Confidence
    'Opportunity Score', 
    'Notes'
  ];

  // Generate Rows
  const rows = creators.map(c => {
    const channelLink = `https://youtube.com/${c.youtubeHandle}`;
    
    return [
      clean(c.name),
      clean(c.youtubeHandle),
      clean(channelLink),
      clean(c.niche),
      clean(c.youtubeSubs),
      clean(c.tiktokStatus === TikTokStatus.NOT_FOUND ? 'Missing' : c.tiktokStatus),
      clean(c.tiktokHandle || 'N/A'),
      clean(c.facebookStatus === TikTokStatus.NOT_FOUND ? 'Missing' : c.facebookStatus),
      clean(c.facebookHandle || 'N/A'),
      clean(c.facebookFollowers || 'N/A'),
      c.facebookConfidence ? c.facebookConfidence.toString() : 'N/A', // Export Confidence
      c.opportunityScore.toString(),
      clean(c.analysis)
    ];
  });

  // Combine
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

// Helper to escape CSV fields (handle commas, quotes, newlines)
const clean = (input: string | undefined | null): string => {
  if (!input) return '';
  const stringValue = String(input);
  // If contains comma, quote or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};
