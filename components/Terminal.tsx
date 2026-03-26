import React, { useState } from 'react';
import { Terminal as TerminalIcon, Upload, Check, Copy, ArrowRight } from 'lucide-react';
import { api } from '../services/mockService';
import { Collection } from '../types';

interface TerminalProps {
  onCollectionCreated: (collection: Collection) => void;
}

export const Terminal: React.FC<TerminalProps> = ({ onCollectionCreated }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "root@lumina:~$ ready for input..."
  ]);
  const [albumName, setAlbumName] = useState("Client_Shoot_2024");

  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const handleSimulateUpload = async () => {
    if (!albumName) return;
    setLoading(true);
    addLog(`root@lumina:~$ ./upload-photos.sh --name="${albumName}" --dir="./export"`);
    
    setTimeout(() => addLog(`> Connecting to secure storage node...`), 300);
    setTimeout(() => addLog(`> Compressing 24 images...`), 600);
    setTimeout(() => addLog(`> Uploading... [====================] 100%`), 1500);
    
    try {
      const collection = await api.createCollection(albumName);
      addLog(`> Success! Collection created.`);
      addLog(`> ID: ${collection.id.substring(0, 12)}...`);
      addLog(`> Generating secure share link...`);
      
      setTimeout(() => {
        onCollectionCreated(collection);
        setLoading(false);
      }, 800);
    } catch (e) {
      addLog(`> Error: Upload failed.`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="bg-surface border border-neutral-800 rounded-lg overflow-hidden shadow-2xl font-mono text-sm">
        {/* Terminal Header */}
        <div className="bg-neutral-900 px-4 py-2 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
          </div>
          <div className="text-neutral-500 flex items-center gap-2">
            <TerminalIcon size={14} />
            <span>zsh — 80x24</span>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 text-green-500 bg-black min-h-[300px] flex flex-col">
          <div className="flex-1 space-y-1 mb-4">
            {logs.map((log, i) => (
              <div key={i} className="opacity-90">{log}</div>
            ))}
            {loading && <div className="animate-pulse">_</div>}
          </div>

          {!loading && (
            <div className="border-t border-neutral-800 pt-4 mt-2">
               <label className="text-neutral-500 text-xs uppercase tracking-wider mb-2 block">
                Quick Action (UI Override)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={albumName}
                  onChange={(e) => setAlbumName(e.target.value)}
                  className="bg-neutral-900 border border-neutral-700 text-white px-3 py-2 rounded focus:outline-none focus:border-green-500 flex-1"
                  placeholder="Enter Album Name"
                />
                <button 
                  onClick={handleSimulateUpload}
                  className="bg-green-600 hover:bg-green-700 text-black font-bold px-6 py-2 rounded flex items-center gap-2 transition-colors"
                >
                  <Upload size={16} />
                  Upload
                </button>
              </div>
              <p className="text-neutral-600 text-xs mt-2">
                * This simulates the CLI script you requested. In production, this would be a Python script running locally.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
