export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  title: string;
  iso?: number;
  aperture?: string;
  shutter?: string;
}

export interface Collection {
  id: string; // The 64-128 char unique ID
  name: string;
  createdAt: number;
  photos: Photo[];
  parentId?: string; // If this was created from another collection
}

export type ViewState = 
  | { type: 'LANDING' }
  | { type: 'ADMIN_DASHBOARD' }
  | { type: 'CLIENT_VIEW'; collectionId: string }
  | { type: 'NOT_FOUND' };
