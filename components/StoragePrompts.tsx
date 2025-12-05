import React, { useState, useEffect } from 'react';
import { HardDrive, Globe, X, Check, Copy, FileSpreadsheet, AlertCircle, Youtube } from 'lucide-react';

interface StoragePromptsProps {
  isOpen: boolean;
  mode: 'FIRST_SAVE' | 'GOOGLE_CONFIG';
  onClose: () => void;
  onDismiss: () => void; // New prop for explicitly choosing "No/Browser Only"
  onEnableLocal: () => void;
  onEnableGoogle: (url: string) => void;
  onSaveSettings?: (sheetUrl: string, ytKeys: string[]) => void;
  currentSheetUrl?: string;
  currentYtKeys?: string[];
}

// UPDATED SCRIPT: APPEND ONLY (No Clear, No Duplicate)
const APPS_SCRIPT_TEMPLATE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rawData = JSON.parse(e.postData.contents);
  var data = Array.isArray(rawData) ? rawData : [rawData];
  
  // 1. Add Headers if sheet is empty (Includes Notes column now)
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Name", "YouTube Handle", "Channel Link", "Niche", "Subscribers", "TikTok Status", "TikTok Handle", "Opportunity Score", "Notes"]);
  }

  // 2. Fetch Existing Handles to Prevent Duplicates
  // We check column B (index 2) for handles
  var existingHandles = [];
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var range = sheet.getRange(2, 2, lastRow - 1, 1);
    var values = range.getValues();
    existingHandles = values.map(function(row) { return String(row[0]); });
  }
  
  // 3. Prepare New Rows (Append Only)
  var rowsToAdd = [];
  data.forEach(function(row) {
    var handle = String(row.youtubeHandle);
    
    // SKIP if handle already exists (Don't replace existing data)
    if (existingHandles.indexOf(handle) === -1) {
       rowsToAdd.push([
         row.name, 
         handle, 
         "https://youtube.com/" + handle,
         row.niche, 
         row.youtubeSubs, 
         row.tiktokStatus, 
         row.tiktokHandle, 
         row.opportunityScore,
         row.analysis || "" // Save the AI analysis as Notes
       ]);
       existingHandles.push(handle); 
    }
  });
  
  // 4. Write to Sheet (Append to bottom)
  if (rowsToAdd.length > 0) {
    sheet.getRange(lastRow + 1, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    return ContentService.createTextOutput("Success: Appended " + rowsToAdd.length + " new rows.");
  }
  
  return ContentService.createTextOutput("Success: No new data (all duplicates skipped).");
}`;

export const StoragePrompts: React.FC<StoragePromptsProps> = ({ 
  isOpen, 
  mode, 
  onClose, 
  onDismiss,
  onEnableLocal, 
  onEnableGoogle, 
  onSaveSettings,
  currentSheetUrl,
  currentYtKeys
}) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [ytKeysInput, setYtKeysInput] = useState('');
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSheetUrl(currentSheetUrl || '');
      setYtKeysInput(currentYtKeys ? currentYtKeys.join('\n') : '');
    }
  }, [isOpen, currentSheetUrl, currentYtKeys]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSaveSettings) {
       const keys = ytKeysInput.split('\n').map(k => k.trim()).filter(k => k.length > 0);
       onSaveSettings(sheetUrl, keys);
    } else {
       onEnableGoogle(sheetUrl);
    }
  };

  // MODE 1: FIRST SAVE PROMPT
  if (mode === 'FIRST_SAVE') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-cyan-900/20 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white" title="Ask me later">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex justify-center mb-6">
            <div className="bg-cyan-500/20 p-4 rounded-full">
              <HardDrive className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2">Where should we save?</h2>
          <p className="text-slate-400 text-center mb-8 text-sm">
            You're starting a new list. We recommend saving directly to a <strong>Local CSV File</strong> or <strong>Google Sheets</strong> so you never lose your data.
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={onEnableLocal}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-cyan-900/20"
            >
              <HardDrive className="w-5 h-5 mr-3" />
              Save to Local File (Auto-Sync)
            </button>

            <button 
              onClick={() => { onClose(); setTimeout(() => onEnableGoogle('OPEN_CONFIG'), 50); }}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center border border-slate-700"
            >
              <Globe className="w-4 h-4 mr-2 text-green-400" />
              Connect Google Sheets
            </button>
            
            <button 
              onClick={onDismiss}
              className="w-full text-slate-500 hover:text-slate-300 text-sm font-medium py-2"
            >
              Browser Storage Only (Not Recommended)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MODE 2: GOOGLE_CONFIG
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center mb-6">
          <div className="bg-slate-800 p-2 rounded-lg mr-3">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white">App Configuration</h2>
        </div>

        <div className="space-y-6">
          {/* Section: Google Sheets */}
          <div className="space-y-4 border-b border-slate-800 pb-6">
             <div className="flex items-center gap-2 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                <h3 className="text-white font-bold">Google Sheets Sync</h3>
             </div>
             
             <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-white font-semibold mb-2 text-sm">Step 1: Get the Web App URL</h3>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                  To allow this tool to "Autosave" to your private sheet, create a simple <strong>Google Apps Script Webhook</strong>.
                  <br/><span className="text-emerald-400 font-bold">Updated: Code now Appends data (no overwriting).</span>
                </p>
                <button 
                  onClick={() => setShowScript(!showScript)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center font-medium"
                >
                  {showScript ? "Hide Code" : "Show Code to Paste"}
                </button>
                
                {showScript && (
                  <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-slate-800 relative group">
                    <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {APPS_SCRIPT_TEMPLATE}
                    </pre>
                    <button 
                      onClick={() => navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE)}
                      className="absolute top-2 right-2 bg-slate-800 text-white p-1.5 rounded hover:bg-slate-700 transition-colors"
                      title="Copy Code"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                )}
                 <div className="mt-3 text-[10px] text-slate-500">
                    1. Open your Google Sheet &gt; Extensions &gt; Apps Script.<br/>
                    2. Paste the code above.<br/>
                    3. Click <strong>Deploy</strong> &gt; <strong>New Deployment</strong>.<br/>
                    4. Select type <strong>Web App</strong>.<br/>
                    5. Set "Who has access" to <strong>Anyone</strong> (Important).<br/>
                    6. Copy the <strong>Web App URL</strong>.
                 </div>
             </div>

             <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">
                   Step 2: Paste Web App URL
                 </label>
                 <div className="relative">
                   <Globe className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                   <input 
                     type="url" 
                     value={sheetUrl}
                     onChange={(e) => setSheetUrl(e.target.value)}
                     placeholder="https://script.google.com/macros/s/..."
                     className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                   />
                 </div>
             </div>
          </div>

          {/* Section: YouTube API */}
          <div>
              <div className="flex items-center gap-2 mb-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h3 className="text-white font-bold">YouTube API (Optional)</h3>
             </div>
             <p className="text-xs text-slate-400 mb-3">
               Add YouTube Data API keys to enable the "Hybrid Mode" hunt (faster & more reliable for large hunts). 
               Keys are stored locally in your browser.
             </p>
             <textarea 
               value={ytKeysInput}
               onChange={(e) => setYtKeysInput(e.target.value)}
               placeholder={"Paste API Keys here...\none_per_line\nAIzaSy..."}
               className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all h-24 font-mono text-xs"
             />
          </div>

          <div className="flex justify-end gap-3 pt-2">
             <button 
               onClick={onClose}
               className="px-4 py-2 text-slate-400 hover:text-white text-sm font-semibold"
             >
               Cancel
             </button>
             <button 
               onClick={handleSave}
               className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center shadow-lg shadow-cyan-900/20 transition-all"
             >
               <Check className="w-4 h-4 mr-2" />
               Save Configuration
             </button>
          </div>
        </div>
      </div>
    );
  };
