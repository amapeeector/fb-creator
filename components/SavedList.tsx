
import React from 'react';
import { Creator, TikTokStatus } from '../types';
import { Download, Trash2, ExternalLink, FileSpreadsheet, HardDrive, RefreshCw, Check, Settings, Globe } from 'lucide-react';
import { generateCSV } from '../utils/csvUtils';

interface SavedListProps {
  savedCreators: Creator[];
  onRemove: (handle: string) => void;
  onClear: () => void;
  onEnableAutoSave: () => void;
  onConfigGoogle: () => void;
  onForceSyncGoogle: () => void; // New Prop
  isAutoSaving: boolean;
  isGoogleSyncing: boolean;
  googleSheetUrl?: string;
}

const SavedList: React.FC<SavedListProps> = ({ 
  savedCreators, 
  onRemove, 
  onClear, 
  onEnableAutoSave, 
  onConfigGoogle,
  onForceSyncGoogle,
  isAutoSaving,
  isGoogleSyncing,
  googleSheetUrl
}) => {
  
  const downloadCSV = () => {
    if (savedCreators.length === 0) return;

    const csvContent = generateCSV(savedCreators);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `crosshunt_list_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (savedCreators.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
        <FileSpreadsheet className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-slate-300 mb-2">Your List is Empty</h3>
        <p className="max-w-md text-center mb-6">Save creators from the "Hunt" tab to build your spreadsheet.</p>
        <div className="flex gap-3">
          <button 
             onClick={onEnableAutoSave}
             className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all border ${isAutoSaving ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'}`}
          >
             {isAutoSaving ? (
               <>
                 <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                 Auto-Sync Active
               </>
             ) : (
               <>
                 <HardDrive className="w-4 h-4 mr-2" />
                 Setup Local Drive
               </>
             )}
          </button>
          <button 
             onClick={onConfigGoogle}
             className="flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all border bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
          >
             <Globe className="w-4 h-4 mr-2" />
             Setup Google Sheets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 backdrop-blur-sm gap-4 lg:gap-0">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileSpreadsheet className="w-6 h-6 mr-2 text-cyan-400" />
            My Spreadsheet
          </h2>
          <div className="flex flex-wrap items-center mt-2 gap-2">
            <p className="text-sm text-slate-400 mr-2">{savedCreators.length} creators saved</p>
            
            {/* Status Badges */}
            {isAutoSaving && (
              <span className="text-[10px] bg-slate-800 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center font-medium">
                <HardDrive className="w-3 h-3 mr-1" /> Local Drive
              </span>
            )}
            
            {googleSheetUrl && (
              <div className="flex items-center gap-1">
                 <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center font-medium border transition-all ${isGoogleSyncing ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-green-400 border-green-500/30'}`}>
                  <Globe className={`w-3 h-3 mr-1 ${isGoogleSyncing ? 'animate-pulse' : ''}`} />
                  {isGoogleSyncing ? "Syncing to Sheets..." : "Google Sheets Linked"}
                </span>
                <button 
                  onClick={onForceSyncGoogle} 
                  disabled={isGoogleSyncing}
                  className="bg-slate-800 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-700"
                  title="Force Sync Now"
                >
                   <RefreshCw className={`w-3 h-3 ${isGoogleSyncing ? 'animate-spin' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3">
          {/* Auto Save Button */}
          <button 
            onClick={onEnableAutoSave}
            disabled={isAutoSaving}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center border ${
              isAutoSaving 
                ? 'bg-slate-900/50 text-slate-400 border-slate-700 cursor-default' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
             {isAutoSaving ? <Check className="w-4 h-4 mr-2" /> : <HardDrive className="w-4 h-4 mr-2" />}
             {isAutoSaving ? "Disk Active" : "Local Drive"}
          </button>

          {/* Google Button */}
           <button 
            onClick={onConfigGoogle}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center border ${
              googleSheetUrl 
                ? 'bg-slate-900/50 text-slate-400 border-slate-700' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Configure Google Sheet"
          >
             {googleSheetUrl ? <Settings className="w-4 h-4 mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
             {googleSheetUrl ? "Sheet Config" : "Connect Sheet"}
          </button>

          <div className="w-px h-8 bg-slate-800 mx-1 hidden md:block"></div>

          <button 
            onClick={onClear}
            className="px-4 py-2 text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-400/10 rounded-lg transition-colors flex items-center"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Clear
          </button>
          
          <button 
            onClick={downloadCSV}
            className="px-5 py-2 text-sm font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-colors flex items-center shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-2xl">
        <table className="w-full text-left text-sm bg-slate-900">
          <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Creator</th>
              <th className="p-4">Niche</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Score</th>
              <th className="p-4">Links</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {savedCreators.map((creator) => (
              <tr key={creator.youtubeHandle} className="hover:bg-slate-800/50 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 mr-3 border border-slate-700">
                       {creator.profileImage && <img src={creator.profileImage} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">{creator.name}</div>
                      <div className="text-xs text-slate-500">{creator.youtubeSubs} Subs</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-slate-300">{creator.niche}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    creator.tiktokStatus === TikTokStatus.NOT_FOUND 
                      ? 'bg-rose-400/10 text-rose-400 border-rose-400/20'
                      : creator.tiktokStatus === TikTokStatus.LOW_PRESENCE
                      ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
                      : 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                  }`}>
                    {creator.tiktokStatus === TikTokStatus.NOT_FOUND ? 'Missing' : creator.tiktokStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <span className={`font-mono font-bold ${creator.opportunityScore > 80 ? 'text-cyan-400' : 'text-slate-400'}`}>
                    {creator.opportunityScore}
                  </span>
                </td>
                <td className="p-4">
                   <div className="flex gap-2">
                      <a href={`https://youtube.com/${creator.youtubeHandle}`} target="_blank" className="text-slate-500 hover:text-red-400" title="YouTube"><ExternalLink className="w-4 h-4" /></a>
                   </div>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => onRemove(creator.youtubeHandle)}
                    className="text-slate-600 hover:text-rose-400 transition-colors p-2"
                    title="Remove from list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavedList;
