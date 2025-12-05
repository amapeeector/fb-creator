
import { GoogleGenAI } from "@google/genai";
import { Creator, TikTokStatus, SearchSource, Platform } from "../types";
import { searchYouTubeAPI } from "./youtubeService";
import { parseSubscriberCount } from "../utils/formatUtils";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function* mergeStreams<T>(streams: AsyncGenerator<T>[]): AsyncGenerator<T> {
  const nextPromises = streams.map((stream, index) => 
    stream.next().then(result => ({ result, index }))
  );

  const activeStreams = new Set(streams.map((_, i) => i));

  while (activeStreams.size > 0) {
    const { result, index } = await Promise.race(
      nextPromises.filter((_, i) => activeStreams.has(i))
    );

    if (result.done) {
      activeStreams.delete(index);
    } else {
      yield result.value;
      nextPromises[index] = streams[index].next().then(nextResult => ({ result: nextResult, index }));
    }
  }
}

export async function* searchCreatorsStream(
  niche: string, 
  minSubs: string, 
  maxSubs: string, 
  avgViews: string,
  resultCount: number,
  contentTypes: string[],
  channelStyle: string,
  targetStatus: TikTokStatus[],
  targetPlatform: Platform,
  searchSource: SearchSource,
  youtubeApiKeys?: string[]
): AsyncGenerator<Creator> {

  // --- HYBRID MODE: YOUTUBE API ---
  if (searchSource === SearchSource.YOUTUBE_API) {
     if (!youtubeApiKeys || youtubeApiKeys.length === 0) {
        throw new Error("No YouTube API Keys provided. Please add them in Settings.");
     }

     console.log(`Fetching ${resultCount} channels via YouTube API...`);
     // Fetch slightly more candidates because we will filter them by Max Subs
     const rawCandidates = await searchYouTubeAPI(youtubeApiKeys, niche, Math.min(resultCount + 20, 50)); 

     // FILTER BY MAX SUBSCRIBERS (Client-side check)
     const minVal = parseSubscriberCount(minSubs);
     const maxVal = maxSubs === 'Any' ? Number.MAX_SAFE_INTEGER : parseSubscriberCount(maxSubs);

     const filteredCandidates = rawCandidates.filter(c => {
        const subCount = parseSubscriberCount(c.youtubeSubs || '0');
        return subCount >= minVal && subCount <= maxVal;
     });

     console.log(`Filtered to ${filteredCandidates.length} candidates based on range ${minSubs}-${maxSubs}`);

     for (const candidate of filteredCandidates) {
        if (!candidate.name) continue;

        const prompt = `
        Act as a Social Media Intelligence Analyst and Expert Facebook Research Engineer.
        Analyze this YouTube Creator for Cross-Platform Presence (TikTok & Facebook).

        Creator Details:
        Name: "${candidate.name}"
        Handle: "${candidate.youtubeHandle}"
        
        TASK 1: TIKTOK AUDIT
        1. Search for official TikTok account.
        2. Status definitions:
           - ACTIVE: Regular posts, link in bio matches.
           - LOW_PRESENCE: Account exists but inactive/ghost.
           - NOT_FOUND: No official account found.

        TASK 2: FACEBOOK PRESENCE (Research Engineer Mode)
        Execute the following matching strategy:
        1. Search Strategy:
           - Perform site-limited searches: ("${candidate.name}" site:facebook.com) and ("${candidate.youtubeHandle}" site:facebook.com).
           - Look for Official Pages or Professional Profiles.
        
        2. Matching & Scoring (Compute Confidence):
           - exact_handle_match: 1.0 if username equals handle.
           - name_exact: 1.0 if normalized names equal.
           - image_match: High confidence if profile picture matches.
           - bio_overlap: High confidence if bio mentions YouTube channel or same keywords.
           - mutual_link: 1.0 if Facebook links to YouTube or vice versa.
        
        3. Confidence Thresholds:
           - FOUND (Status: ACTIVE): Confidence >= 0.8.
           - LIKELY (Status: LOW_PRESENCE): Confidence 0.5 to 0.79.
           - NOT_FOUND (Status: NOT_FOUND): Confidence < 0.5.

        Target Filter (${targetPlatform}): ${targetStatus.join(' OR ')}
        
        Output JSON:
        {
          "tiktokStatus": "ACTIVE|LOW_PRESENCE|NOT_FOUND", 
          "tiktokHandle": "string", 
          "facebookStatus": "ACTIVE|LOW_PRESENCE|NOT_FOUND",
          "facebookHandle": "string (or Page Name)",
          "facebookFollowers": "string (estimate)",
          "facebookConfidence": number (0.0 to 1.0),
          "match_reasoning": ["exact_handle", "mutual_link", etc],
          "opportunityScore": number (0-100, higher if missing on BOTH platforms), 
          "analysis": "string (brief reasoning for both)"
        }
        `;

        try {
           const result = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: { tools: [{ googleSearch: {} }] } 
           });
           
           const analysis = JSON.parse(result.text || '{}');
           let tkStatus = analysis.tiktokStatus as TikTokStatus;
           if (!Object.values(TikTokStatus).includes(tkStatus)) tkStatus = TikTokStatus.NOT_FOUND;

           let fbStatus = analysis.facebookStatus as TikTokStatus;
           if (!Object.values(TikTokStatus).includes(fbStatus)) fbStatus = TikTokStatus.NOT_FOUND;

           const statusToCheck = targetPlatform === Platform.FACEBOOK ? fbStatus : tkStatus;

           if (targetStatus.includes(statusToCheck)) {
              yield {
                  name: candidate.name!,
                  niche: niche,
                  youtubeHandle: candidate.youtubeHandle!,
                  youtubeSubs: candidate.youtubeSubs!,
                  profileImage: candidate.profileImage,
                  tiktokStatus: tkStatus,
                  tiktokHandle: analysis.tiktokHandle,
                  facebookStatus: fbStatus,
                  facebookHandle: analysis.facebookHandle,
                  facebookFollowers: analysis.facebookFollowers,
                  facebookConfidence: analysis.facebookConfidence,
                  opportunityScore: analysis.opportunityScore || 0,
                  analysis: analysis.analysis || "Analyzed via YouTube API + Gemini",
                  source: SearchSource.YOUTUBE_API
              };
           }
        } catch (e) {
           console.error("Error analyzing candidate", candidate.name, e);
        }
     }
     return; 
  }
  
  // --- STANDARD GEMINI MODE ---
  const MAX_CONCURRENT_REQUESTS = 3; 
  let concurrency = 1;
  if (resultCount >= 20) concurrency = 2;
  if (resultCount >= 40) concurrency = 3;
  if (resultCount >= 60) concurrency = MAX_CONCURRENT_REQUESTS;

  const batchSize = Math.ceil(resultCount / concurrency);
  const streams: AsyncGenerator<Creator>[] = [];

  console.log(`Starting Hunt: ${resultCount} items via ${concurrency} parallel threads using ${searchSource}.`);

  // Determine if we are hunting for Micro-Influencers
  const isMicroHunt = maxSubs !== 'Any' && parseSubscriberCount(maxSubs) <= 100000;

  const searchVectors = isMicroHunt 
    ? [
        "Search for 'underrated' and 'hidden gem' channels.",
        "Search for 'up and coming' creators in this niche.",
        "Search for 'small channel' with high engagement.",
        "Search for 'new youtuber' gaining traction."
      ]
    : [
        "Start with Top Rated channels.",
        "Start with Recently Trending channels.",
        "Start with 'Best of' lists.",
        "Start with Hidden Gem channels."
      ];

  for (let i = 0; i < concurrency; i++) {
    const count = (i === concurrency - 1) 
      ? resultCount - (batchSize * (concurrency - 1)) 
      : batchSize;
    
    const vector = searchVectors[i % searchVectors.length];
    
    if (count > 0) {
      streams.push(
        generateBatch(niche, minSubs, maxSubs, avgViews, count, contentTypes, channelStyle, targetStatus, targetPlatform, i, searchSource, vector)
      );
    }
  }

  const mergedStream = mergeStreams(streams);

  for await (const creator of mergedStream) {
    yield creator;
  }
}

async function* generateBatch(
  niche: string, 
  minSubs: string, 
  maxSubs: string,
  avgViews: string,
  count: number,
  contentTypes: string[],
  channelStyle: string,
  targetStatus: TikTokStatus[],
  targetPlatform: Platform,
  batchId: number,
  searchSource: SearchSource,
  searchVector: string
): AsyncGenerator<Creator> {
  
  const model = "gemini-2.5-flash";
  const contentProfile = contentTypes.length > 0 ? contentTypes.join(", ") : "Any Format";
  const isHashtag = niche.startsWith('#');
  
  let statusInstruction = "";
  let goalInstruction = "";
  const isOnlyActive = targetStatus.length === 1 && targetStatus.includes(TikTokStatus.ACTIVE);

  // Check if we are in Micro-Influencer Mode
  const maxSubVal = maxSubs === 'Any' ? 100000000 : parseSubscriberCount(maxSubs);
  const isMicroHunt = maxSubVal <= 100000;

  const platformName = targetPlatform === Platform.FACEBOOK ? 'Facebook' : 'TikTok';

  if (searchSource === SearchSource.YOUTUBE_DB) {
      if (isHashtag) {
         goalInstruction = `Act as a YouTube Discovery Engine. Find ${count} YouTube channels that are actively ranking for the HASHTAG "${niche}".`;
      } else if (isMicroHunt) {
         goalInstruction = `Act as a Talent Scout for Micro-Influencers. 
         Use specific Google Search queries (e.g., "underrated ${niche} channels", "best small ${niche} youtubers", "site:youtube.com ${niche}") to find '${count}' HIDDEN GEM YouTube Channels.
         Avoid famous channels. Focus on the ${minSubs} to ${maxSubs} range.`;
      } else {
         goalInstruction = `Act as a YouTube Search Engine. Use the Google Search tool to find '${count}' actual YouTube Channels in the '${niche}' niche.`;
      }
      statusInstruction = isOnlyActive 
         ? `Only return creators ACTIVE on ${platformName}.` 
         : `Filter based on ${platformName} status: ${targetStatus.join(' OR ')}.`;
  } 
  else {
     goalInstruction = `Act as a Web Researcher. Search Google for "${isMicroHunt ? 'Underrated' : 'Best'} ${niche} YouTube channels" listicles. Extract ${count} channels.`;
     statusInstruction = `Check their ${platformName} status manually.`;
  }

  const styleInstruction = channelStyle !== "Any" ? `VISUAL STYLE: Must be "${channelStyle}".` : "";

  const prompt = `${goalInstruction}

  BATCH SEGMENT: ${batchId + 1}
  SEARCH VECTOR: ${searchVector}

  CRITICAL INSTRUCTION:
  1. VERIFY SUBSCRIBER COUNT: Must be between ${minSubs} and ${maxSubs}.
  2. CROSS-PLATFORM CHECK (Facebook & TikTok):
     - Act as a Facebook Research Engineer.
     - Search for matching Facebook Pages/Profiles.
     - Calculate Match Confidence based on: Exact Handle Match (1.0), Name Exact (1.0), Mutual Links, Bio Overlap.
     - Facebook Status: 
        * ACTIVE (Confidence >= 0.8)
        * LOW_PRESENCE (Confidence 0.5-0.79)
        * NOT_FOUND (Confidence < 0.5)
     - TikTok Status: ACTIVE / LOW_PRESENCE / NOT_FOUND
  
  PARAMETERS:
  - Niche/Query: "${niche}"
  - Format: "${contentProfile}"
  - ${styleInstruction}
  - ${statusInstruction}
  
  OUTPUT FORMAT:
  - Output NDJSON (Newline Delimited JSON).
  - ONE JSON object per line.
  - NO markdown formatting (\`\`\`).
  - Calculate 'opportunityScore' based on MISSING presence on ${platformName} (primary) and others (secondary).

  SCHEMA:
  {"name": "string", "niche": "string", "youtubeSubs": "string", "youtubeHandle": "string", "profileImage": "string_url", "tiktokStatus": "NOT_FOUND"|"LOW_PRESENCE"|"ACTIVE", "tiktokHandle": "string", "facebookStatus": "NOT_FOUND"|"LOW_PRESENCE"|"ACTIVE", "facebookHandle": "string", "facebookFollowers": "string", "facebookConfidence": number, "opportunityScore": number, "analysis": "short string"}
  `;

  let retries = 3;
  while (retries > 0) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });

      let buffer = "";
      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (!text) continue;
        buffer += text;
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; 
        for (const line of lines) {
          try {
            const cleanLine = line.trim().replace(/,$/, ""); 
            if (!cleanLine || cleanLine.startsWith("```")) continue;
            const creator = JSON.parse(cleanLine);
            if (creator.name && creator.youtubeHandle) {
              let tkStatus = creator.tiktokStatus;
              if (!Object.values(TikTokStatus).includes(tkStatus)) tkStatus = TikTokStatus.NOT_FOUND;
              
              let fbStatus = creator.facebookStatus;
              if (!Object.values(TikTokStatus).includes(fbStatus)) fbStatus = TikTokStatus.NOT_FOUND;

              yield { ...creator, tiktokStatus: tkStatus, facebookStatus: fbStatus, source: searchSource };
            }
          } catch (e) {}
        }
      }
      return; 
    } catch (e) {
      retries--;
      if (retries > 0) await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
