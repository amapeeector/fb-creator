
import React, { useState, useEffect } from 'react';
import { Search, Filter, Radar, Shuffle, Eye, Youtube, Users, Camera, Crosshair, CheckSquare, Database, Hash, Type } from 'lucide-react';
import { SearchParams, TikTokStatus, SearchSource, Platform } from '../types';

interface SearchFormProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

const NICHE_IDEAS = [
  "True Crime", "Personal Finance", "Retro Tech", "History", "Coding Tutorials", 
  "Woodworking", "Conspiracy Theories", "Biohacking", "ASMR", "Minecraft Gaming",
  "Roblox Gaming", "Speedrunning", "Chess", "Poker/Gambling", "Street Food Reviews",
  "Travel Vlogs", "Van Life", "Tiny Homes", "Gardening/Homesteading", "Survival Skills",
  "Military History", "Space/Astronomy", "Physics/Science", "Mathematics", "Philosophy",
  "Self Improvement", "Dating Advice", "Men's Fashion", "Sneakerheads", "Makeup Tutorials",
  "Skincare Reviews", "Hair Styling", "Nail Art", "Cosplay", "Anime Reviews",
  "K-Pop News", "Movie Essays", "Horror Stories", "Urban Exploration", "Car Restoration",
  "EV Reviews", "Motorcycles", "Fishing", "Hunting", "Golf Tips",
  "Basketball Analysis", "UFC/MMA Commentary", "Bodybuilding", "Calisthenics", "Yoga",
  "Vegan Cooking", "BBQ/Grilling", "Baking", "Coffee Brewing", "Bartending"
];

const SUBSCRIBER_OPTIONS = ["1K", "5K", "10K", "25K", "50K", "100K", "250K", "500K", "1M", "5M", "10M+"];
const VIEW_OPTIONS = ["10K+", "50K+", "100K+", "500K+", "1M+", "5M+", "10M+", "30M+", "50M+", "100M+"];
const COUNT_OPTIONS = [10, 25, 50, 75, 100];
const CHANNEL_STYLES = [
  "Any",
  "Face Cam / Personality (Face Value)",
  "Faceless / Voiceover",
  "Stock Footage / Static Images",
  "Animation / Art"
];

const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
  const getStored = (key: string, def: any) => {
    try {
      const saved = localStorage.getItem('crosshunt_search_prefs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[key] !== undefined ? parsed[key] : def;
      }
    } catch (e) {}
    return def;
  };

  const [niche, setNiche] = useState<string>(() => getStored('niche', 'True Crime'));
  const [searchType, setSearchType] = useState<'keyword' | 'hashtag'>('keyword');

  const [minSubs, setMinSubs] = useState<string>(() => getStored('minSubs', '10K'));
  const [maxSubs, setMaxSubs] = useState<string>(() => getStored('maxSubs', 'Any'));
  const [avgViews, setAvgViews] = useState<string>(() => getStored('avgViews', '10K+'));
  
  const [resultCount, setResultCount] = useState<number>(() => getStored('resultCount', 10));
  const [channelStyle, setChannelStyle] = useState<string>(() => getStored('channelStyle', 'Any'));
  const [searchSource, setSearchSource] = useState<SearchSource>(() => getStored('searchSource', SearchSource.YOUTUBE_DB));
  
  const [includeLongForm, setIncludeLongForm] = useState<boolean>(() => getStored('includeLongForm', true));
  const [includeShorts, setIncludeShorts] = useState<boolean>(() => getStored('includeShorts', false));
  const [includeLive, setIncludeLive] = useState<boolean>(() => getStored('includeLive', false));

  const [targetPlatform, setTargetPlatform] = useState<Platform>(() => getStored('targetPlatform', Platform.TIKTOK));
  const [targetMissing, setTargetMissing] = useState<boolean>(() => getStored('targetMissing', true));
  const [targetLow, setTargetLow] = useState<boolean>(() => getStored('targetLow', true));
  const [targetActive, setTargetActive] = useState<boolean>(() => getStored('targetActive', false));

  useEffect(() => {
    const prefs = {
      niche,
      minSubs,
      maxSubs,
      avgViews,
      resultCount,
      channelStyle,
      searchSource,
      includeLongForm,
      includeShorts,
      includeLive,
      targetPlatform,
      targetMissing,
      targetLow,
      targetActive
    };
    localStorage.setItem('crosshunt_search_prefs', JSON.stringify(prefs));
  }, [niche, minSubs, maxSubs, avgViews, resultCount, channelStyle, searchSource, includeLongForm, includeShorts, includeLive, targetPlatform, targetMissing, targetLow, targetActive]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const contentTypes = [];
    if (includeLongForm) contentTypes.push("Long-form Video");
    if (includeShorts) contentTypes.push("YouTube Shorts");
    if (includeLive) contentTypes.push("Live Streams");
    if (contentTypes.length === 0) contentTypes.push("Long-form Video");

    const targetStatus: TikTokStatus[] = [];
    if (targetMissing) targetStatus.push(TikTokStatus.NOT_FOUND);
    if (targetLow) targetStatus.push(TikTokStatus.LOW_PRESENCE);
    if (targetActive) targetStatus.push(TikTokStatus.ACTIVE);
    if (targetStatus.length === 0) targetStatus.push(TikTokStatus.NOT_FOUND);

    let finalQuery = niche;
    if (searchType === 'hashtag' && !finalQuery.trim().startsWith('#')) {
        finalQuery = `#${finalQuery.trim()}`;
    }

    onSearch({ 
      niche: finalQuery, 
      minSubs, 
      maxSubs,
      avgViews, 
      resultCount,
      contentTypes,
      channelStyle,
      targetStatus,
      targetPlatform,
      searchSource
    });
  };

  const handleRandomize = () => {
    const randomNiche = NICHE_IDEAS[Math.floor(Math.random() * NICHE_IDEAS.length)];
    setNiche(randomNiche);
    setSearchType('keyword');
  };

  const toggleAllStatuses = () => {
    const allSelected = targetMissing && targetLow && targetActive;
    setTargetMissing(!allSelected);
    setTargetLow(!allSelected);
    setTargetActive(!allSelected);
  };

  return (
    <div className="w-full max-w-6xl mx-auto mb-12">
      <form onSubmit={handleSubmit} className="relative z-10">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl p-6 shadow-2xl shadow-cyan-900/20 flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <div className="flex gap-4 ml-1">
                <label className={`flex items-center cursor-pointer transition-colors ${searchType === 'keyword' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-300'}`}>
                    <input type="radio" name="searchType" className="hidden" checked={searchType === 'keyword'} onChange={() => setSearchType('keyword')} />
                    <Type className="w-4 h-4 mr-1.5" />
                    <span className="text-xs uppercase tracking-wider">Keyword / Niche</span>
                </label>
                <label className={`flex items-center cursor-pointer transition-colors ${searchType === 'hashtag' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-300'}`}>
                    <input type="radio" name="searchType" className="hidden" checked={searchType === 'hashtag'} onChange={() => setSearchType('hashtag')} />
                    <Hash className="w-4 h-4 mr-1.5" />
                    <span className="text-xs uppercase tracking-wider">Hashtag Hunt</span>
                </label>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-grow group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                  {searchType === 'hashtag' ? <Hash className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </div>
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder={searchType === 'hashtag' ? "Enter hashtag (e.g. #vanlife)" : "Enter a Niche or Keyword..."}
                  list="niche-list"
                  className="w-full bg-slate-800/50 text-white pl-12 pr-4 py-4 rounded-xl focus:outline-none focus:bg-slate-800 focus:ring-1 focus:ring-cyan-500 placeholder-slate-500 font-medium transition-all border border-transparent focus:border-cyan-500/50 text-lg"
                  disabled={isLoading}
                />
                <datalist id="niche-list">{NICHE_IDEAS.map((idea) => (<option key={idea} value={idea} />))}</datalist>
              </div>
              <button type="button" onClick={handleRandomize} disabled={isLoading} className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 rounded-xl transition-all flex items-center justify-center border border-slate-700">
                <Shuffle className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* SUBSCRIBER RANGE */}
            <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
              <label className="text-xs text-slate-400 font-semibold uppercase mb-2 flex items-center">
                <Users className="w-3 h-3 mr-1" /> Subscriber Range
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                   <span className="text-[10px] text-slate-500 block mb-0.5">Min</span>
                   <select 
                    value={minSubs} 
                    onChange={(e) => setMinSubs(e.target.value)}
                    className="w-full bg-slate-900 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white cursor-pointer"
                   >
                    {SUBSCRIBER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                </div>
                <div className="flex-1">
                   <span className="text-[10px] text-slate-500 block mb-0.5">Max</span>
                   <select 
                    value={maxSubs} 
                    onChange={(e) => setMaxSubs(e.target.value)}
                    className="w-full bg-slate-900 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white cursor-pointer"
                   >
                    <option value="Any">Any</option>
                    {SUBSCRIBER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                   </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
              <label className="text-xs text-slate-400 font-semibold uppercase mb-2 flex items-center">
                <Eye className="w-3 h-3 mr-1" /> Avg Views
              </label>
              <select 
                value={avgViews} 
                onChange={(e) => setAvgViews(e.target.value)}
                className="w-full bg-slate-900 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white cursor-pointer mt-4"
              >
                {VIEW_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

             <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
              <label className="text-xs text-slate-400 font-semibold uppercase mb-2 flex items-center">
                <Filter className="w-3 h-3 mr-1" /> Results to Find
              </label>
              <select 
                value={resultCount} 
                onChange={(e) => setResultCount(Number(e.target.value))}
                className="w-full bg-slate-900 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white cursor-pointer mt-4"
              >
                {COUNT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50">
              <label className="text-xs text-slate-400 font-semibold uppercase mb-2 flex items-center">
                <Camera className="w-3 h-3 mr-1" /> Visual Style
              </label>
              <select 
                value={channelStyle} 
                onChange={(e) => setChannelStyle(e.target.value)}
                className="w-full bg-slate-900 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white cursor-pointer mt-4"
              >
                {CHANNEL_STYLES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 flex flex-col justify-center">
               <label className="text-xs text-slate-400 font-semibold uppercase mb-2 flex items-center">
                  <Database className="w-3 h-3 mr-1" /> Hunt Source
                </label>
                <select 
                  value={searchSource} 
                  onChange={(e) => setSearchSource(e.target.value as SearchSource)}
                  className="w-full bg-slate-900 rounded px-2 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none text-white cursor-pointer"
                >
                  <option value={SearchSource.YOUTUBE_DB}>YouTube Search Engine (AI)</option>
                  <option value={SearchSource.YOUTUBE_API}>YouTube Data API (Direct)</option>
                  <option value={SearchSource.WEB_SEARCH}>Google Web Search</option>
                </select>
            </div>

            <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 flex flex-col justify-center">
               <label className="text-xs text-slate-400 font-semibold uppercase mb-2 flex items-center">
                  <Youtube className="w-3 h-3 mr-1" /> Content Type
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center cursor-pointer group">
                     <input type="checkbox" checked={includeLongForm} onChange={(e) => setIncludeLongForm(e.target.checked)} className="accent-cyan-500 w-4 h-4" />
                     <span className="ml-2 text-sm text-slate-300 group-hover:text-white font-medium">Long-form</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                     <input type="checkbox" checked={includeShorts} onChange={(e) => setIncludeShorts(e.target.checked)} className="accent-cyan-500 w-4 h-4" />
                     <span className="ml-2 text-sm text-slate-300 group-hover:text-white font-medium">Shorts</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                     <input type="checkbox" checked={includeLive} onChange={(e) => setIncludeLive(e.target.checked)} className="accent-cyan-500 w-4 h-4" />
                     <span className="ml-2 text-sm text-slate-300 group-hover:text-white font-medium">Live</span>
                  </label>
                </div>
            </div>

            <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-700/50 flex flex-col justify-center">
               <div className="flex justify-between items-center mb-2">
                 <label className="text-xs text-slate-400 font-semibold uppercase flex items-center">
                    <Crosshair className="w-3 h-3 mr-1" /> Target Status
                  </label>
                  
                  {/* PLATFORM TOGGLE */}
                  <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-700">
                      <button
                          type="button"
                          onClick={() => setTargetPlatform(Platform.TIKTOK)}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${targetPlatform === Platform.TIKTOK ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                          TikTok
                      </button>
                      <button
                          type="button"
                          onClick={() => setTargetPlatform(Platform.FACEBOOK)}
                           className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${targetPlatform === Platform.FACEBOOK ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                          Facebook
                      </button>
                  </div>
               </div>
               
               <div className="flex justify-between items-center w-full">
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" checked={targetMissing} onChange={(e) => setTargetMissing(e.target.checked)} className="accent-rose-500 w-4 h-4" />
                      <span className="ml-2 text-sm text-rose-200 group-hover:text-rose-100 font-medium">Missing</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" checked={targetLow} onChange={(e) => setTargetLow(e.target.checked)} className="accent-amber-500 w-4 h-4" />
                      <span className="ml-2 text-sm text-amber-200 group-hover:text-amber-100 font-medium">Low</span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input type="checkbox" checked={targetActive} onChange={(e) => setTargetActive(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                      <span className="ml-2 text-sm text-emerald-200 group-hover:text-emerald-100 font-medium">Active</span>
                    </label>
                  </div>
                  <button type="button" onClick={toggleAllStatuses} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center uppercase font-bold ml-2">
                    <CheckSquare className="w-3 h-3" />
                  </button>
               </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 flex items-center justify-center whitespace-nowrap text-lg"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Scanning {resultCount} Channels for {targetPlatform} Gaps...
              </span>
            ) : (
              <span className="flex items-center">
                <Radar className="w-6 h-6 mr-2" />
                Start Hunt ({resultCount} Results)
              </span>
            )}
          </button>
        </div>
      </form>
      <div className="text-center mt-4 text-slate-500 text-xs md:text-sm flex flex-wrap justify-center items-center gap-4 opacity-70">
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span> Missing on {targetPlatform}</span>
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span> Low Presence</span>
        <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Active</span>
      </div>
    </div>
  );
};

export default SearchForm;
