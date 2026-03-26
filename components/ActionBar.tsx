import React from 'react';
import { Download, Share2, X } from 'lucide-react';

interface ActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({ 
  selectedCount, 
  onClear, 
  onDownload, 
  onShare 
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 w-[90%] max-w-md animate-slide-up">
      <div className="bg-surface/90 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-accent text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
            {selectedCount}
          </div>
          <span className="text-sm font-medium text-white">Selected</span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onClear}
            className="p-2 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="h-6 w-px bg-white/10 mx-1"></div>
          
          <button 
            onClick={onDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button 
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-sm font-medium transition-colors"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share Selection</span>
          </button>
        </div>
      </div>
    </div>
  );
};
