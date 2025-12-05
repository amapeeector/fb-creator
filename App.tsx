
import React, { useState, useEffect, useRef } from 'react';
import { searchCreatorsStream } from './services/geminiService'; 
import { Creator, SearchParams, TikTokStatus, SortOption, SearchHistoryItem, AppSettings, Platform } from './types';
import { THEMES, Theme } from './themes';
import SearchForm from './components/SearchForm';
import CreatorCard from './components/CreatorCard';
import SavedList from './components/SavedList';
import HistoryView from './components/HistoryView';
import { StoragePrompts } from './components/StoragePrompts';
import { Crosshair, ListFilter, AlertTriangle, Check, X, FileSpreadsheet, History as HistoryIcon, Radar, SaveAll, Palette } from 'lucide-react';
import { generateCSV } from './utils/csvUtils';
import { parseSubscriberCount } from './utils/formatUtils';

const App: React.FC = () => {
  const [currentThemeId, setCurrentThemeId] = useState<string>(() => {
    return localStorage.getItem('crosshunt_theme') || 'cyberpunk';
  });
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<'hunt' | 'list' | 'history'>('hunt');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);
  const [streamCount, setStreamCount] = useState(0); 
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchPlatform, setSearchPlatform] = useState<Platform>(Platform.TIKTOK);

  const [savedCreators, setSavedCreators] = useState<Creator[]>(() => {
    const saved = localStorage.getItem('crosshunt_saved');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>(() => {
    const history = localStorage.getItem('crosshunt_history');
    return history ? JSON.parse(history) : [];
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const stored = localStorage.getItem('crosshunt_settings');
    const parsed = stored ? JSON.parse(stored) : {};
    return { 
      hasPromptedLocalSave: false, 
      googleSheetUrl: '', 
      youtubeApiKeys: [], 
      storageConfigured: false,
      ...parsed 
    };
  });

  const [fileHandle, setFileHandle] = useState<any>(null);
  const [isAutoSaveActive, setIsAutoSaveActive] = useState(false);
  const [lastSavedCount, setLastSavedCount] = useState(0);
  const [isGoogleSyncing, setIsGoogleSyncing] = useState(false);
  const [storagePromptOpen, setStoragePromptOpen] = useState(false);
  const [storageMode, setStorageMode] = useState<'FIRST_SAVE' | 'GOOGLE_CONFIG'>('FIRST_SAVE');

  const [statusFilters, setStatusFilters] = useState<Record<TikTokStatus, boolean>>({
    [TikTokStatus.NOT_FOUND]: true,
    [TikTokStatus.LOW_PRESENCE]: true,
    [TikTokStatus.ACTIVE]: false
  });
  const [sortBy, setSortBy] = useState<SortOption>(SortOption.OPPORTUNITY);

  useEffect(() => {
    localStorage.setItem('crosshunt_theme', currentThemeId);
    const theme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];
    Object.entries(theme.colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [currentThemeId]);

  useEffect(() => { localStorage.setItem('crosshunt_saved', JSON.stringify(savedCreators)); }, [savedCreators]);
  useEffect(() => { localStorage.setItem('crosshunt_history', JSON.stringify(searchHistory)); }, [searchHistory]);
  useEffect(() => { localStorage.setItem('crosshunt_settings', JSON.stringify(settings)); }, [settings]);

  const enableLocalAutoSave = async () => {
    try {
      // @ts-ignore
      const handle = await window.showSaveFilePicker({
        suggestedName: `crosshunt_list_${new Date().toISOString().slice(0,10)}.csv`,
        types: [{ description: 'CSV File', accept: { 'text/csv': ['.csv'] } }],
      });
      setFileHandle(handle);
      setIsAutoSaveActive(true);
      await writeToLocalFile(handle, savedCreators);
      setLastSavedCount(savedCreators.length);
      setStoragePromptOpen(false);
      setSettings(prev => ({ ...prev, hasPromptedLocalSave: true, storageConfigured: true }));
    } catch (err) {
      console.error("Cancelled", err);
    }
  };

  const writeToLocalFile = async (handle: any, data: Creator[]) => {
    if (!handle || data.length === 0) return;
    try {
      const csvContent = generateCSV(data);
      const writable = await handle.createWritable();
      await writable.write(csvContent);
      await writable.close();
    } catch (err) { console.error(err); }
  };

  const enableGoogleSync = (url: string) => {
    if (url === 'OPEN_CONFIG') {
      setStorageMode('GOOGLE_CONFIG');
      setStoragePromptOpen(true);
      return;
    }
    setSettings(prev => ({ ...prev, googleSheetUrl: url, storageConfigured: true }));
    setStoragePromptOpen(false);
    syncToGoogleSheet(url, savedCreators);
  };

  const handleSaveSettings = (sheetUrl: string, ytKeys: string[]) => {
    setSettings(prev => ({ 
      ...prev, 
      googleSheetUrl: sheetUrl, 
      youtubeApiKeys: ytKeys, 
      storageConfigured: true 
    }));
    setStoragePromptOpen(false);
    if (sheetUrl) syncToGoogleSheet(sheetUrl, savedCreators);
  };

  const syncToGoogleSheet = async (url: string, data: Creator[]) => {
    if (!url || data.length === 0) return;
    setIsGoogleSyncing(true);
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain' }, 
        body: JSON.stringify(data)
      });
    } catch (err) { console.error(err); } 
    finally { setTimeout(() => setIsGoogleSyncing(false), 2000); }
  };
  
  const handleDismissStorage = () => {
    setSettings(prev => ({ ...prev, storageConfigured: true }));
    setStoragePromptOpen(false);
  };

  useEffect(() => {
    const autoSaveDisk = async () => {
      if (isAutoSaveActive && fileHandle && savedCreators.length !== lastSavedCount) {
        await writeToLocalFile(fileHandle, savedCreators);
        setLastSavedCount(savedCreators.length);
      }
    };
    const timeout = setTimeout(autoSaveDisk, 1000);
    return () => clearTimeout(timeout);
  }, [savedCreators, fileHandle, isAutoSaveActive, lastSavedCount]);

  const handleSearch = async (params: SearchParams) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setActiveTab('hunt');
    setCreators([]); 
    setStreamCount(0);
    setSearchPlatform(params.targetPlatform);
    
    const newFilters = {
      [TikTokStatus.NOT_FOUND]: params.targetStatus.includes(TikTokStatus.NOT_FOUND),
      [TikTokStatus.LOW_PRESENCE]: params.targetStatus.includes(TikTokStatus.LOW_PRESENCE),
      [TikTokStatus.ACTIVE]: params.targetStatus.includes(TikTokStatus.ACTIVE)
    };
    setStatusFilters(newFilters);

    try {
      const stream = searchCreatorsStream(
        params.niche, 
        params.minSubs, 
        params.maxSubs, // Pass Max Subs
        params.avgViews, 
        params.resultCount, 
        params.contentTypes,
        params.channelStyle,
        params.targetStatus,
        params.targetPlatform,
        params.searchSource,
        settings.youtubeApiKeys
      );

      const collectedResults: Creator[] = [];

      for await (const creator of stream) {
        collectedResults.push(creator);
        setCreators(prev => [...prev, creator]);
        setStreamCount(prev => prev + 1);
      }

      const newItem: SearchHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        params: params,
        resultSummary: `Found ${collectedResults.length} channels`
      };
      setSearchHistory(prev => [newItem, ...prev].slice(0, 20));

    } catch (err) {
      setError(`Failed to hunt creators: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCreator = (creator: Creator) => {
    const isNew = !savedCreators.some(c => c.youtubeHandle === creator.youtubeHandle);
    if (isNew) {
      setSavedCreators(prev => [...prev, { ...creator, addedAt: new Date().toISOString() }]);
      if (!settings.storageConfigured && !isAutoSaveActive && !settings.googleSheetUrl) {
        setStorageMode('FIRST_SAVE');
        setStoragePromptOpen(true);
      }
    }
  };

  const handleRemoveCreator = (handle: string) => setSavedCreators(prev => prev.filter(c => c.youtubeHandle !== handle));
  const handleBulkSaveMissing = () => {
    // Determine which status to check based on what was searched
    const missing = creators.filter(c => {
       const status = searchPlatform === Platform.FACEBOOK ? c.facebookStatus : c.tiktokStatus;
       return status === TikTokStatus.NOT_FOUND || status === TikTokStatus.LOW_PRESENCE;
    });
    const newUnique = missing.filter(c => !savedCreators.some(saved => saved.youtubeHandle === c.youtubeHandle));
    if (newUnique.length > 0) {
      setSavedCreators(prev => [...prev, ...newUnique.map(c => ({...c, addedAt: new Date().toISOString()}))]);
      if (!settings.storageConfigured && !isAutoSaveActive && !settings.googleSheetUrl) {
        setStorageMode('FIRST_SAVE');
        setStoragePromptOpen(true);
      }
    }
  };

  const openGoogleConfig = () => { setStorageMode('GOOGLE_CONFIG'); setStoragePromptOpen(true); };
  const forceSyncGoogle = () => { if (settings.googleSheetUrl) syncToGoogleSheet(settings.googleSheetUrl, savedCreators); };
  const clearHistory = () => setSearchHistory([]);
  const clearList = () => { if (confirm("Delete all?")) setSavedCreators([]); };
  const toggleStatusFilter = (status: TikTokStatus) => { setStatusFilters(prev => ({ ...prev, [status]: !prev[status] })); };

  const filteredCreators = creators
    .filter(c => {
        // Filter based on the platform we are targeting
        const status = searchPlatform === Platform.FACEBOOK ? c.facebookStatus : c.tiktokStatus;
        return statusFilters[status || TikTokStatus.NOT_FOUND];
    })
    .sort((a, b) => {
      if (sortBy === SortOption.OPPORTUNITY) return b.opportunityScore - a.opportunityScore;
      return parseSubscriberCount(b.youtubeSubs) - parseSubscriberCount(a.youtubeSubs);
    });

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-x-hidden font-sans transition-colors duration-500">
      <StoragePrompts 
        isOpen={storagePromptOpen}
        mode={storageMode}
        onClose={() => setStoragePromptOpen(false)}
        onDismiss={handleDismissStorage}
        onEnableLocal={enableLocalAutoSave}
        onEnableGoogle={enableGoogleSync}
        onSaveSettings={handleSaveSettings}
        currentSheetUrl={settings.googleSheetUrl}
        currentYtKeys={settings.youtubeApiKeys}
      />
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
      </div>
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none z-0"></div>

      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 transition-colors duration-300">
         <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={() => setActiveTab('hunt')}>
              <div className="bg-cyan-500 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                 <Crosshair className="w-5 h-5 text-slate-900" />
              </div>
              <span className="font-bold text-lg tracking-tight hidden sm:block text-white">CrossHunt</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                   <button onClick={() => setActiveTab('hunt')} className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'hunt' ? 'bg-slate-800 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-white'}`}><Radar className={`w-4 h-4 md:mr-2 ${loading ? 'animate-spin' : ''}`} /> <span className="hidden md:inline">Hunt</span></button>
                   <button onClick={() => setActiveTab('list')} className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'list' ? 'bg-slate-800 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-white'}`}><FileSpreadsheet className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">My List</span>{savedCreators.length > 0 && <span className="ml-2 bg-slate-700 text-white text-[10px] px-1.5 rounded-full">{savedCreators.length}</span>}</button>
                   <button onClick={() => setActiveTab('history')} className={`flex items-center px-3 md:px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'history' ? 'bg-slate-800 text-cyan-500 shadow-sm' : 'text-slate-400 hover:text-white'}`}><HistoryIcon className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">History</span></button>
                </div>
                <div className="relative">
                  <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-500 transition-colors"><Palette className="w-5 h-5" /></button>
                  {isThemeMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                      {THEMES.map(theme => (
                        <button key={theme.id} onClick={() => { setCurrentThemeId(theme.id); setIsThemeMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-800 flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: theme.colors['--bg-main'] }} />
                          <span className={`${currentThemeId === theme.id ? 'text-cyan-500 font-bold' : 'text-slate-300'}`}>{theme.name}</span>
                          {currentThemeId === theme.id && <Check className="w-3 h-3 ml-auto text-cyan-500" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
            </div>
         </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {activeTab === 'hunt' && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
             <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500">Find <span className="text-cyan-500">Untapped</span> Creators</h1>
              <p className="text-slate-400 text-sm md:text-base">Real-time arbitrage finder. Identifying opportunities on the fly.</p>
            </div>
            <SearchForm onSearch={handleSearch} isLoading={loading} />
            {error && (<div className="w-full max-w-2xl p-4 bg-rose-950/30 border border-rose-500/30 text-rose-200 rounded-xl flex items-center mb-8"><AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />{error}</div>)}
            {loading && (<div className="w-full max-w-xl mb-8 flex flex-col items-center animate-pulse"><div className="flex items-center gap-3 text-cyan-500 font-mono font-bold bg-cyan-500/10 px-6 py-2 rounded-full border border-cyan-500/20"><div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></div>Hunting in progress... Found {streamCount}</div></div>)}
            {(hasSearched || creators.length > 0) && (
              <div className="w-full max-w-7xl">
                <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800/50 backdrop-blur-sm sticky top-20 z-30 shadow-xl shadow-slate-950/50 transition-colors duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-white">Results <span className="text-sm font-normal text-slate-500">({searchPlatform})</span></h2><span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-full font-mono border border-slate-700">{filteredCreators.length} shown</span></div>
                    <button onClick={handleBulkSaveMissing} className="flex items-center gap-1.5 text-xs font-bold bg-cyan-900/30 hover:bg-cyan-900/50 text-cyan-500 border border-cyan-500/30 px-3 py-1.5 rounded-lg transition-colors" title={`Add all 'Missing' and 'Low Presence' channels on ${searchPlatform} to My List`}><SaveAll className="w-3 h-3" /> Save All Missing</button>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-end">
                    <div className="flex items-center gap-1 bg-slate-950/50 rounded-lg p-1 border border-slate-800">
                       <button onClick={() => toggleStatusFilter(TikTokStatus.NOT_FOUND)} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-md transition-all ${statusFilters[TikTokStatus.NOT_FOUND] ? 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/50' : 'text-slate-500'}`}>{statusFilters[TikTokStatus.NOT_FOUND] ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />} Missing</button>
                       <button onClick={() => toggleStatusFilter(TikTokStatus.LOW_PRESENCE)} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-md transition-all ${statusFilters[TikTokStatus.LOW_PRESENCE] ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50' : 'text-slate-500'}`}>{statusFilters[TikTokStatus.LOW_PRESENCE] ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />} Low</button>
                       <button onClick={() => toggleStatusFilter(TikTokStatus.ACTIVE)} className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-md transition-all ${statusFilters[TikTokStatus.ACTIVE] ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50' : 'text-slate-500'}`}>{statusFilters[TikTokStatus.ACTIVE] ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />} Active</button>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <ListFilter className="w-4 h-4 text-slate-400" />
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="bg-slate-800 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-1.5 border-none outline-none">
                        <option value={SortOption.OPPORTUNITY}>Sort: Opportunity</option>
                        <option value={SortOption.SUBS}>Sort: Subscribers</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                  {filteredCreators.map((creator, index) => (
                    <div key={`${creator.youtubeHandle}-${index}`} className="animate-in fade-in slide-in-from-bottom-8 duration-500 fill-mode-backwards" style={{ animationDelay: `${index % 10 * 50}ms` }}>
                      <CreatorCard creator={creator} isSaved={savedCreators.some(c => c.youtubeHandle === creator.youtubeHandle)} onSave={handleSaveCreator} onRemove={handleRemoveCreator} />
                    </div>
                  ))}
                </div>
                {filteredCreators.length === 0 && creators.length > 0 && (<div className="text-center py-12 text-slate-500 bg-slate-900/20 border border-dashed border-slate-800 rounded-xl">{loading ? "Filtering results..." : "No results visible with current status filters. Try enabling 'Active'."}</div>)}
              </div>
            )}
             {!hasSearched && !loading && (<div className="mt-8 text-center opacity-40 max-w-lg"><p className="text-sm text-slate-500">Recent searches are saved automatically to History.</p></div>)}
          </div>
        )}
        {activeTab === 'list' && (
          <div className="max-w-7xl mx-auto">
            <SavedList savedCreators={savedCreators} onRemove={handleRemoveCreator} onClear={clearList} onEnableAutoSave={() => { setStorageMode('FIRST_SAVE'); setStoragePromptOpen(true); }} onConfigGoogle={openGoogleConfig} onForceSyncGoogle={forceSyncGoogle} isAutoSaving={isAutoSaveActive} isGoogleSyncing={isGoogleSyncing} googleSheetUrl={settings.googleSheetUrl} />
          </div>
        )}
        {activeTab === 'history' && (
          <div className="max-w-5xl mx-auto">
            <HistoryView history={searchHistory} onRestore={handleSearch} onClear={clearHistory} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
