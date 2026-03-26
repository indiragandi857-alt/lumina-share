import React, { useState, useEffect, useMemo } from 'react';
import { Terminal } from './components/Terminal';
import { PhotoGrid } from './components/PhotoGrid';
import { Lightbox } from './components/Lightbox';
import { ActionBar } from './components/ActionBar';
import { api } from './services/mockService';
import { Collection, Photo, ViewState } from './types';
import { Copy, Camera, ArrowLeft, Home } from 'lucide-react';

const App: React.FC = () => {
  // --- Routing State ---
  const [viewState, setViewState] = useState<ViewState>({ type: 'LANDING' });
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  
  // --- Interaction State ---
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [newShareUrl, setNewShareUrl] = useState('');

  // --- Router Logic (Hash based) ---
  useEffect(() => {
    const handleHashChange = async () => {
      const hash = window.location.hash;
      
      if (hash === '#/admin') {
        setViewState({ type: 'ADMIN_DASHBOARD' });
      } else if (hash.startsWith('#/s/')) {
        const id = hash.replace('#/s/', '');
        try {
          const collection = await api.getCollection(id);
          if (collection) {
            setActiveCollection(collection);
            setViewState({ type: 'CLIENT_VIEW', collectionId: id });
          } else {
            setViewState({ type: 'NOT_FOUND' });
          }
        } catch (e) {
          setViewState({ type: 'NOT_FOUND' });
        }
      } else {
        setViewState({ type: 'LANDING' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Run on mount

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // --- Handlers ---

  const handleCreateCollection = (collection: Collection) => {
    setActiveCollection(collection);
    // Simulate navigation to the client view
    window.location.hash = `/s/${collection.id}`;
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleLightboxNav = (direction: 'next' | 'prev') => {
    if (!lightboxPhoto || !activeCollection) return;
    const currentIndex = activeCollection.photos.findIndex(p => p.id === lightboxPhoto.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    
    // Bounds check
    if (nextIndex < 0) nextIndex = activeCollection.photos.length - 1;
    if (nextIndex >= activeCollection.photos.length) nextIndex = 0;
    
    setLightboxPhoto(activeCollection.photos[nextIndex]);
  };

  const handleCreateSubShare = async () => {
    if (!activeCollection || selectedIds.size === 0) return;
    
    const selectedPhotos = activeCollection.photos.filter(p => selectedIds.has(p.id));
    const name = `${activeCollection.name} (Selection)`;
    
    // Create new collection in mock DB
    const newCollection = await api.createSubCollection(name, selectedPhotos, activeCollection.id);
    
    const url = `${window.location.origin}/#/s/${newCollection.id}`;
    setNewShareUrl(url);
    setIsShareModalOpen(true);
  };

  const handleDownload = () => {
    alert(`Simulating download of ${selectedIds.size} files...`);
    setSelectedIds(new Set());
  };

  // --- Render Helpers ---

  const renderLanding = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-4 text-center">LUMINA</h1>
      <p className="text-neutral-400 mb-8 text-center max-w-md">
        Minimalist, secure photo sharing for professionals.
        <br/> Upload via CLI, share via Link.
      </p>
      <div className="flex gap-4">
        <a href="#/admin" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition">
          Photographer Login
        </a>
      </div>
    </div>
  );

  const renderNotFound = () => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
      <h1 className="text-4xl font-bold mb-4 text-red-500">404</h1>
      <h2 className="text-2xl font-bold mb-4">Collection Not Found</h2>
      <p className="text-neutral-400 mb-8 max-w-md">
        This link might be expired, incorrect, or the secure storage node is unreachable.
      </p>
      <a href="#" className="flex items-center gap-2 px-6 py-3 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700 transition">
        <Home size={18} />
        Return Home
      </a>
    </div>
  );

  const renderAdmin = () => (
    <div className="min-h-screen bg-neutral-950 p-6 flex flex-col items-center pt-24">
       <div className="w-full max-w-3xl flex items-center justify-between mb-8">
          <a href="#" className="flex items-center gap-2 text-neutral-400 hover:text-white">
            <ArrowLeft size={20} /> Back
          </a>
          <h2 className="text-xl font-mono text-green-500">System Control</h2>
       </div>
       <Terminal onCollectionCreated={handleCreateCollection} />
    </div>
  );

  const renderClientView = () => {
    if (!activeCollection) return <div className="min-h-screen flex items-center justify-center text-neutral-500">Connecting to secure node...</div>;

    return (
      <div className="min-h-screen bg-background text-white">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{activeCollection.name}</h1>
            <p className="text-xs text-neutral-500">{activeCollection.photos.length} photos</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
               onClick={() => setSelectedIds(new Set(activeCollection.photos.map(p => p.id)))}
               className="text-xs text-neutral-400 hover:text-white uppercase tracking-wider"
            >
              Select All
            </button>
          </div>
        </header>

        {/* Grid */}
        <PhotoGrid 
          photos={activeCollection.photos} 
          onPhotoClick={setLightboxPhoto}
          selectedIds={selectedIds}
          toggleSelection={toggleSelection}
          isSelectionMode={selectedIds.size > 0}
        />

        {/* Overlays */}
        <Lightbox 
          photo={lightboxPhoto} 
          onClose={() => setLightboxPhoto(null)} 
          onNext={() => handleLightboxNav('next')}
          onPrev={() => handleLightboxNav('prev')}
        />

        <ActionBar 
          selectedCount={selectedIds.size}
          onClear={() => setSelectedIds(new Set())}
          onDownload={handleDownload}
          onShare={handleCreateSubShare}
        />

        {/* Share Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-surface border border-neutral-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">New Link Created</h3>
                <button onClick={() => setIsShareModalOpen(false)}><XIcon /></button>
              </div>
              <p className="text-neutral-400 text-sm mb-4">
                You've created a new collection with {selectedIds.size} photos. Share this secure link:
              </p>
              
              <div className="flex items-center gap-2 bg-black/50 p-2 rounded-lg border border-neutral-800 mb-6">
                <code className="flex-1 text-xs text-green-400 truncate overflow-hidden">
                  {newShareUrl}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(newShareUrl);
                    alert("Copied to clipboard!");
                  }}
                  className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded text-white"
                >
                  <Copy size={16} />
                </button>
              </div>

              <div className="flex gap-3">
                 <button 
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setSelectedIds(new Set());
                  }}
                  className="flex-1 py-2 bg-white text-black rounded-lg font-bold hover:bg-neutral-200"
                 >
                   Done
                 </button>
                 <a 
                   href={newShareUrl}
                   target="_blank"
                   rel="noreferrer"
                   className="flex-1 py-2 bg-neutral-800 text-white text-center rounded-lg font-medium hover:bg-neutral-700"
                 >
                   Open Link
                 </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="antialiased selection:bg-accent selection:text-white">
      {viewState.type === 'LANDING' && renderLanding()}
      {viewState.type === 'ADMIN_DASHBOARD' && renderAdmin()}
      {viewState.type === 'CLIENT_VIEW' && renderClientView()}
      {viewState.type === 'NOT_FOUND' && renderNotFound()}
    </main>
  );
};

const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default App;
