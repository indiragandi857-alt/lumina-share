import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Photo } from '../types';
import { CheckCircle, Maximize2, Download } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick: (photo: Photo) => void;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  isSelectionMode: boolean;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({ 
  photos, 
  onPhotoClick, 
  selectedIds, 
  toggleSelection,
  isSelectionMode
}) => {
  const [displayedPhotos, setDisplayedPhotos] = useState<Photo[]>([]);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);
  const BATCH_SIZE = 12;

  // Initial load
  useEffect(() => {
    setDisplayedPhotos(photos.slice(0, BATCH_SIZE));
    setPage(1);
  }, [photos]);

  // Infinite Scroll Logic
  const loadMore = useCallback(() => {
    const nextBatch = photos.slice(0, (page + 1) * BATCH_SIZE);
    setDisplayedPhotos(nextBatch);
    setPage(p => p + 1);
  }, [page, photos]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && displayedPhotos.length < photos.length) {
          loadMore();
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMore, displayedPhotos.length, photos.length]);

  return (
    <div className="pb-32">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-4 p-1 md:p-8">
        {displayedPhotos.map((photo) => {
          const isSelected = selectedIds.has(photo.id);
          
          return (
            <div 
              key={photo.id}
              className={`relative group aspect-[3/4] overflow-hidden bg-neutral-900 rounded-lg cursor-pointer transition-all duration-300 ${isSelected ? 'ring-4 ring-accent scale-95' : 'hover:opacity-95'}`}
              onClick={() => {
                if (isSelectionMode) {
                  toggleSelection(photo.id);
                } else {
                  onPhotoClick(photo);
                }
              }}
            >
              {/* Image */}
              <img 
                src={photo.thumbnail} 
                alt={photo.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Overlays */}
              <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${isSelected || isSelectionMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                
                {/* Selection Circle */}
                <div 
                  className="absolute top-3 left-3 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelection(photo.id);
                  }}
                >
                  {isSelected ? (
                    <CheckCircle className="text-accent fill-white" size={24} />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-white/50 hover:border-white transition-colors"></div>
                  )}
                </div>

                {/* Info (Only show if not selecting) */}
                {!isSelectionMode && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-full group-hover:translate-y-0 transition-transform">
                    <p className="text-white text-sm font-medium truncate">{photo.title}</p>
                    <p className="text-neutral-400 text-xs">{photo.aperture} • {photo.shutter} • ISO {photo.iso}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Intersection Observer Target */}
      <div ref={observerTarget} className="h-20 w-full flex justify-center items-center">
        {displayedPhotos.length < photos.length && (
          <div className="w-2 h-2 bg-neutral-600 rounded-full animate-ping"></div>
        )}
      </div>
    </div>
  );
};
