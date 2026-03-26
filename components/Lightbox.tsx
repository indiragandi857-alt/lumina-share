import React from 'react';
import { X, Download, ChevronLeft, ChevronRight, Share2, Info } from 'lucide-react';
import { Photo } from '../types';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ photo, onClose, onNext, onPrev }) => {
  if (!photo) return null;

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrev]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-fade-in backdrop-blur-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-4 absolute top-0 w-full z-10 bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white/80 font-mono text-sm">
          {photo.title}
        </div>
        <div className="flex gap-4">
          <button className="text-white/70 hover:text-white transition-colors" title="Download">
             <Download size={20} />
          </button>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center relative px-4 md:px-12">
        
        {/* Nav Prev */}
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-2 md:left-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          <ChevronLeft size={32} />
        </button>

        <img 
          src={photo.url} 
          alt={photo.title}
          className="max-h-[85vh] max-w-full object-contain shadow-2xl" 
        />

        {/* Nav Next */}
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-2 md:right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-neutral-400 bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
        <span className="flex items-center gap-1"><Info size={12}/> EXIF:</span>
        <span>{photo.aperture}</span>
        <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
        <span>{photo.shutter}</span>
        <span className="w-1 h-1 rounded-full bg-neutral-600"></span>
        <span>ISO {photo.iso}</span>
      </div>
    </div>
  );
};
