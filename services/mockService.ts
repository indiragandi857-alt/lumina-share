import { Collection, Photo } from '../types';

const STORAGE_KEY = 'lumina_db_v1';

// Helper to generate a long random string (64 chars) with fallback
export const generateSecureId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for non-secure contexts
  return 'x' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Generate Mock Photos using Picsum
export const generateMockPhotos = (count: number): Photo[] => {
  return Array.from({ length: count }).map((_, i) => {
    const id = `photo-${Date.now()}-${i}`;
    const width = Math.random() > 0.5 ? 800 : 600;
    const height = Math.random() > 0.5 ? 600 : 800;
    
    return {
      id,
      url: `https://picsum.photos/id/${(i % 50) + 10}/1200/1600`, // High res
      thumbnail: `https://picsum.photos/id/${(i % 50) + 10}/400/500`, // Low res
      width,
      height,
      title: `IMG_${2024 + i}.RAW`,
      iso: [100, 200, 400, 800, 1600][Math.floor(Math.random() * 5)],
      aperture: ['f/1.4', 'f/2.8', 'f/4.0', 'f/8.0'][Math.floor(Math.random() * 4)],
      shutter: ['1/250', '1/500', '1/1000', '1/2000'][Math.floor(Math.random() * 4)],
    };
  });
};

// Persistence Logic
const loadDb = (): Record<string, Collection> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load DB", e);
    return {};
  }
};

const saveDb = (db: Record<string, Collection>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save DB", e);
  }
};

// In-memory cache backed by localStorage
let db: Record<string, Collection> = loadDb();

export const api = {
  createCollection: async (name: string, photoCount: number = 24): Promise<Collection> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const id = generateSecureId();
    const newCollection: Collection = {
      id,
      name,
      createdAt: Date.now(),
      photos: generateMockPhotos(photoCount)
    };
    
    db[id] = newCollection;
    saveDb(db);
    return newCollection;
  },

  createSubCollection: async (name: string, photos: Photo[], parentId: string): Promise<Collection> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const id = generateSecureId();
    const newCollection: Collection = {
      id,
      name,
      createdAt: Date.now(),
      photos, // Subset of photos
      parentId
    };
    
    db[id] = newCollection;
    saveDb(db);
    return newCollection;
  },

  getCollection: async (id: string): Promise<Collection | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Reload from storage to catch updates from other tabs
    db = loadDb(); 
    return db[id] || null;
  }
};
