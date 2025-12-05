
import React, { useState } from 'react';
import { Creator, TikTokStatus } from '../types';
import { Youtube, AlertCircle, CheckCircle2, XCircle, Search, Save, Check, ExternalLink, Facebook } from 'lucide-react';

interface CreatorCardProps {
  creator: Creator;
  isSaved?: boolean;
  onSave?: (creator: Creator) => void;
  onRemove?: (handle: string) => void;
}

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, isSaved = false, onSave, onRemove }) => {
  const [imgError, setImgError] = useState(false);

  const getStatusColor = (status: TikTokStatus) => {
    switch (status) {
      case TikTokStatus.NOT_FOUND:
        return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case TikTokStatus.LOW_PRESENCE:
        return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case TikTokStatus.ACTIVE:
        return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  const handleSaveToggle = () => {
    if (isSaved && onRemove) {
      onRemove(creator.youtubeHandle);
    } else if (!isSaved && onSave) {
      onSave(creator);
    }
  };

  // Fallback image generator if no logo provided or load fails
  const safeName = creator.name.replace(/\s+/g, '');
  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(creator.name)}&background=0f172a&color=06b6d4&size=256&font-size=0.33`;
  const imageSrc = (!imgError && creator.profileImage) ? creator.profileImage : fallbackImage;

  // Deep Check Queries
  const deepCheckQuery = `"${creator.name}" (site:tiktok.com OR site:facebook.com OR site:linktr.ee)`;
  const youtubeSearchQuery = `${creator.name} channel`;

  // Helper to render platform status row
  const PlatformRow = ({ 
    icon: Icon, 
    label, 
    status, 
    handle, 
    followers, 
    searchUrl,
    colorClass
  }: { 
    icon: any, label: string, status: TikTokStatus, handle?: string, followers?: string, searchUrl: string, colorClass: string 
  }) => (
    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
      <div className="flex items-center gap-3 overflow-hidden flex-1">
        <div className={`p-1.5 rounded-md ${colorClass} bg-opacity-10`}>
          <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
           <div className="flex items-center gap-1.5">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
             <div className={`flex items-center text-[10px] font-bold ${getStatusColor(status).split(' ')[0]}`}>
                {status === TikTokStatus.NOT_FOUND ? 'MISSING' : status === TikTokStatus.LOW_PRESENCE ? 'LOW' : 'ACTIVE'}
             </div>
           </div>
           <div className="flex items-center gap-2 text-xs font-mono text-slate-300 w-full">
             <span className="truncate" title={handle || 'Not found'}>
               {handle || 'N/A'}
             </span>
             {followers && (
                <span className="flex-shrink-0 text-[10px] text-slate-500 bg-slate-950/50 px-1.5 rounded border border-slate-800" title="Follower Count">
                  {followers}
                </span>
             )}
           </div>
        </div>
      </div>
      <a 
        href={searchUrl}
        target="_blank"
        rel="noreferrer" 
        className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-700 rounded transition-colors flex-shrink-0 ml-2"
        title={`Search ${label} for ${creator.name}`}
      >
        <Search className="w-3.5 h-3.5" />
      </a>
    </div>
  );

  const cleanHandle = (h?: string) => h?.replace(/^@/, '') || '';

  return (
    <div className={`relative group bg-slate-900 border rounded-xl p-5 transition-all duration-300 flex flex-col h-full overflow-hidden ${isSaved ? 'border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-slate-800 hover:border-cyan-500/30 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'}`}>
      
      {/* Background Logo Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src={imageSrc} 
          alt={`${creator.name} background`}
          className="w-full h-full object-cover opacity-10 group-hover:opacity-15 transition-opacity blur-sm scale-110 grayscale hover:grayscale-0"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-slate-900/80"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
             <div className="w-10 h-10 rounded-full border-2 border-slate-700 overflow-hidden mr-3 flex-shrink-0 shadow-md bg-slate-800">
                <img src={imageSrc} alt="icon" className="w-full h-full object-cover" onError={() => setImgError(true)}/>
             </div>
             <div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight pr-2">{creator.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <a 
                    href={`https://youtube.com/${creator.youtubeHandle}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center"
                  >
                    <Youtube className="w-3 h-3 mr-1" />
                    {creator.youtubeHandle}
                  </a>
                </div>
             </div>
          </div>
          <div className="flex flex-col items-end">
             <button 
                onClick={handleSaveToggle}
                className={`p-1.5 rounded-lg mb-1 transition-all ${isSaved ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                title={isSaved ? "Remove from list" : "Save to list"}
             >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
             </button>
             <div className="text-sm font-mono font-bold text-white">{creator.youtubeSubs}</div>
          </div>
        </div>

        <div className="space-y-2 flex-grow">
          {/* Opportunity Score Bar */}
          <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 backdrop-blur-md mb-3">
             <div className="flex justify-between items-center mb-1">
               <span className="text-[10px] text-slate-500 uppercase font-bold">Arbitrage Opportunity</span>
               <span className="text-xs text-cyan-400 font-bold">{creator.opportunityScore}/100</span>
             </div>
             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${creator.opportunityScore > 75 ? 'bg-cyan-500' : 'bg-slate-600'}`} 
                  style={{ width: `${creator.opportunityScore}%` }}
                ></div>
             </div>
          </div>

          {/* Platform Grid */}
          <div className="space-y-1.5">
            <PlatformRow 
              icon={TikTokIcon}
              label="TikTok"
              status={creator.tiktokStatus}
              handle={creator.tiktokHandle}
              searchUrl={`https://www.tiktok.com/search?q=${encodeURIComponent(creator.name)}`}
              colorClass="text-pink-500"
            />
            
            <PlatformRow 
              icon={Facebook}
              label="Facebook"
              status={creator.facebookStatus || TikTokStatus.NOT_FOUND}
              handle={creator.facebookHandle}
              followers={creator.facebookFollowers}
              // Using site:facebook.com with quoted name for specific verification
              searchUrl={`https://www.google.com/search?q=${encodeURIComponent(`site:facebook.com "${creator.name}"`)}`}
              colorClass="text-blue-500"
            />
          </div>

          <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-3 italic mt-3">
            "{creator.analysis}"
          </p>
        </div>
        
        {/* Social Direct Links */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex gap-2">
            <a 
              href={`https://www.youtube.com/@${cleanHandle(creator.youtubeHandle)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center py-2 rounded-lg bg-slate-800 hover:bg-red-900/20 text-slate-400 hover:text-red-500 border border-slate-700/50 hover:border-red-500/30 transition-all group/icon"
              title="Open YouTube Channel"
            >
               <Youtube className="w-4 h-4" />
            </a>

            <a 
              href={creator.tiktokHandle ? `https://www.tiktok.com/@${cleanHandle(creator.tiktokHandle)}` : '#'}
              target="_blank"
              rel="noreferrer"
              className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-all ${
                 creator.tiktokHandle && creator.tiktokStatus !== TikTokStatus.NOT_FOUND 
                 ? 'bg-slate-800 hover:bg-pink-900/20 text-slate-400 hover:text-pink-500 border-slate-700/50 hover:border-pink-500/30 cursor-pointer' 
                 : 'bg-slate-900/50 text-slate-700 cursor-not-allowed border-transparent'
              }`}
              title={creator.tiktokHandle ? "Open TikTok Profile" : "No TikTok found"}
              onClick={(e) => { if(!creator.tiktokHandle || creator.tiktokStatus === TikTokStatus.NOT_FOUND) e.preventDefault(); }}
            >
               <TikTokIcon className="w-4 h-4" />
            </a>

            <a 
              href={creator.facebookHandle ? `https://www.facebook.com/${cleanHandle(creator.facebookHandle)}` : '#'}
              target="_blank"
              rel="noreferrer"
              className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-all ${
                 creator.facebookHandle && creator.facebookStatus !== TikTokStatus.NOT_FOUND 
                 ? 'bg-slate-800 hover:bg-blue-900/20 text-slate-400 hover:text-blue-500 border-slate-700/50 hover:border-blue-500/30 cursor-pointer' 
                 : 'bg-slate-900/50 text-slate-700 cursor-not-allowed border-transparent'
              }`}
              title={creator.facebookHandle ? "Open Facebook Page" : "No Facebook found"}
              onClick={(e) => { if(!creator.facebookHandle || creator.facebookStatus === TikTokStatus.NOT_FOUND) e.preventDefault(); }}
            >
               <Facebook className="w-4 h-4" />
            </a>
        </div>

        {/* Search Actions */}
        <div className="mt-2 grid grid-cols-2 gap-2">
          <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeSearchQuery)}`} 
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-2 rounded-lg transition-colors backdrop-blur-sm"
          >
             <Youtube className="w-3 h-3 mr-1.5" />
             YT Search
          </a>
          <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(deepCheckQuery)}`} 
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold py-2 rounded-lg transition-colors border border-slate-700 backdrop-blur-sm"
          >
             <ExternalLink className="w-3 h-3 mr-1.5" />
             Deep Verify
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard;
