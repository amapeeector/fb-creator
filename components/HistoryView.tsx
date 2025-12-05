
import React from 'react';
import { SearchHistoryItem, SearchParams, TikTokStatus } from '../types';
import { History, Clock, ArrowRight, RotateCcw, Trash2 } from 'lucide-react';

interface HistoryViewProps {
  history: SearchHistoryItem[];
  onRestore: (params: SearchParams) => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onRestore, onClear }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
        <History className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-slate-300 mb-2">No History Yet</h3>
        <p className="max-w-md text-center">Your recent searches will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Clock className="w-6 h-6 mr-2 text-cyan-400" />
          Recent Activity
        </h2>
        <button 
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-rose-400 flex items-center transition-colors"
        >
          <Trash2 className="w-3 h-3 mr-1" /> Clear History
        </button>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div 
            key={item.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyan-900/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="flex items-center mb-2">
                  <span className="text-lg font-bold text-white mr-3">{item.params.niche}</span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    Subs: <span className="text-slate-200">{item.params.minSubs} - {item.params.maxSubs || 'Any'}</span>
                  </span>
                  <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    Avg Views: <span className="text-slate-200">{item.params.avgViews}</span>
                  </span>
                   <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">
                    Format: <span className="text-slate-200">{item.params.channelStyle === 'Any' ? 'All Styles' : item.params.channelStyle}</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0 mt-1 md:mt-0">
                 <div className="text-xs font-medium text-cyan-400/80 italic">
                    {item.resultSummary || "Search Results"}
                 </div>
                 <button 
                    onClick={() => onRestore(item.params)}
                    className="flex items-center bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg font-semibold transition-colors border border-cyan-500/20"
                 >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Rerun Hunt
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
