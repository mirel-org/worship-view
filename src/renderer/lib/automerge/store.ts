import { v4 as uuidv4 } from 'uuid';
import { getDocumentHandle } from './repo';
import { AutomergeSong, AutomergeServiceListItem, UUID, AutomergeDocument } from './types';
import { parseSong } from '../songParser';
import type { Song } from '@ipc/song/song.types';

// Response types matching the old API for compatibility
export interface SongResponse {
  id: string; // Changed from number to UUID string
  name: string;
  fullText: string;
}

export interface ServiceListSongResponse {
  id: string; // Changed from number to UUID string
  songId: string; // Changed from number to UUID string
  position: number;
  song: SongResponse;
}

// Convert AutomergeSong to SongResponse
function automergeSongToResponse(song: AutomergeSong): SongResponse {
  return {
    id: song.id,
    name: song.name,
    fullText: song.fullText,
  };
}

// Get all songs
export async function getSongs(): Promise<SongResponse[]> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();
  
  const songsMap = doc?.songs as Record<string, AutomergeSong> | undefined;
  if (!doc || !songsMap) {
    return [];
  }

  return Object.values(songsMap).map(automergeSongToResponse);
}

// Get song by ID
export async function getSongById(id: string): Promise<SongResponse> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();
  
  const songsMap = doc?.songs as Record<string, AutomergeSong> | undefined;
  if (!doc || !songsMap || !songsMap[id]) {
    throw new Error('Song not found');
  }

  return automergeSongToResponse(songsMap[id]);
}

// Get song content
export async function getSongContent(id: string): Promise<string> {
  const song = await getSongById(id);
  return song.fullText;
}

// Save new song
export async function saveSong(
  name: string,
  content: string,
): Promise<SongResponse> {
  const handle = await getDocumentHandle();
  
  // Ensure document is ready
  await handle.whenReady();
  
  const id = uuidv4();

  // Make the change
  handle.change((doc: AutomergeDocument) => {
    // Initialize songs if it doesn't exist
    if (!doc.songs) {
      doc.songs = {};
    }
    
    // Create the song object
    const song: AutomergeSong = {
      id,
      name,
      fullText: content,
    };
    
    // Add to songs map
    const songsMap = doc.songs as Record<string, AutomergeSong>;
    songsMap[id] = song;
    
    console.log('Song added to document:', { id, name, songsCount: Object.keys(songsMap).length });
  });
  
  // Force the change event to propagate by accessing the document
  // This ensures any listeners are notified
  const _ = handle.doc();

  // In Automerge, changes are synchronous, so the document should be updated immediately
  // But we'll verify it's there

  // Get the updated document
  const updatedDoc = handle.doc();
  if (!updatedDoc) {
    throw new Error('Document not available after change');
  }
  
  const songsMap = updatedDoc.songs as Record<string, AutomergeSong> | undefined;
  if (!songsMap || !songsMap[id]) {
    console.error('Song not found after change. Document state:', updatedDoc);
    throw new Error('Song was not added to document');
  }
  
  return automergeSongToResponse(songsMap[id]);
}

// Update song
export async function updateSong(
  id: string,
  updates: { name?: string; fullText?: string },
): Promise<SongResponse> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();

  if (!doc || !doc.songs || !doc.songs[id]) {
    throw new Error('Song not found');
  }

  handle.change((doc: AutomergeDocument) => {
    const songsMap = doc.songs as Record<string, AutomergeSong>;
    if (updates.name !== undefined) {
      songsMap[id].name = updates.name;
    }
    if (updates.fullText !== undefined) {
      songsMap[id].fullText = updates.fullText;
    }
  });

  const updatedDoc = handle.doc();
  return automergeSongToResponse(updatedDoc!.songs[id]);
}

// Rename song
export async function renameSong(
  id: string,
  newName: string,
): Promise<SongResponse> {
  return updateSong(id, { name: newName });
}

// Delete song
export async function deleteSong(id: string): Promise<{ success: boolean }> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();

  if (!doc || !doc.songs || !doc.songs[id]) {
    throw new Error('Song not found');
  }

  handle.change((doc: AutomergeDocument) => {
    const songsMap = doc.songs as Record<string, AutomergeSong>;
    delete songsMap[id];
    // Also remove from service list if present
    if (doc.serviceList) {
      // Filter and create new objects with updated positions to avoid reference issues
      doc.serviceList = doc.serviceList
        .filter((item: AutomergeServiceListItem) => item.songId !== id)
        .map((item: AutomergeServiceListItem, index: number) => ({
          songId: item.songId,
          position: index + 1,
        }));
    }
  });

  return { success: true };
}

// Batch upsert songs
export interface BatchUpsertSong {
  name: string;
  fullText: string;
}

export interface BatchUpsertResponse {
  success: boolean;
  created: number;
  errorCount: number;
  results: SongResponse[];
  errors?: Array<{ name: string; error: string }>;
}

export async function batchUpsertSongs(
  songs: BatchUpsertSong[],
): Promise<BatchUpsertResponse> {
  const handle = await getDocumentHandle();
  const results: SongResponse[] = [];
  const errors: Array<{ name: string; error: string }> = [];

  handle.change((doc: AutomergeDocument) => {
    if (!doc.songs) {
      doc.songs = {};
    }

    for (const song of songs) {
      try {
        if (!song.name || !song.fullText) {
          errors.push({ name: song.name || 'unknown', error: 'Name and fullText are required' });
          continue;
        }

        // Check if song with same name exists
        const songsMap = doc.songs as Record<string, AutomergeSong>;
        const existingSong = Object.values(songsMap).find((s: AutomergeSong) => s.name === song.name);
        
        if (existingSong) {
          // Update existing song
          existingSong.fullText = song.fullText;
          results.push(automergeSongToResponse(existingSong));
        } else {
          // Create new song
          const id = uuidv4();
          songsMap[id] = {
            id,
            name: song.name,
            fullText: song.fullText,
          };
          results.push(automergeSongToResponse(songsMap[id]));
        }
      } catch (error: any) {
        errors.push({ name: song.name, error: error.message || 'Unknown error' });
      }
    }
  });

  return {
    success: true,
    created: results.length,
    errorCount: errors.length,
    results,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// Delete all songs
export interface DeleteAllResponse {
  success: boolean;
  deletedCount: number;
}

export async function deleteAllSongs(): Promise<DeleteAllResponse> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();
  
  const count = doc?.songs ? Object.keys(doc.songs as Record<string, AutomergeSong>).length : 0;

  handle.change((doc: AutomergeDocument) => {
    doc.songs = {};
    doc.serviceList = [];
  });

  return {
    success: true,
    deletedCount: count,
  };
}

// Service List Functions

// Get service list
export async function getServiceList(): Promise<ServiceListSongResponse[]> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();

  if (!doc || !doc.serviceList || !doc.songs) {
    return [];
  }

  return doc.serviceList
    .sort((a: AutomergeServiceListItem, b: AutomergeServiceListItem) => a.position - b.position)
    .map((item: AutomergeServiceListItem) => {
      const songsMap = doc.songs as Record<string, AutomergeSong>;
      const song = songsMap[item.songId];
      if (!song) {
        // Song was deleted but still in service list, skip it
        return null;
      }
      return {
        id: item.songId, // Use songId as stable ID since each song can only appear once
        songId: item.songId,
        position: item.position,
        song: automergeSongToResponse(song),
      };
    })
    .filter((item: ServiceListSongResponse | null): item is ServiceListSongResponse => item !== null);
}

// Add to service list
export async function addToServiceList(
  songId: string,
): Promise<ServiceListSongResponse> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();

  const songsMap = doc?.songs as Record<string, AutomergeSong> | undefined;
  if (!doc || !songsMap || !songsMap[songId]) {
    throw new Error('Song not found');
  }

  // Check if already in service list
  const existing = doc.serviceList?.find((item: AutomergeServiceListItem) => item.songId === songId);
  if (existing) {
    throw new Error('Song is already in the service list');
  }

  const maxPosition = doc.serviceList?.length
    ? Math.max(...doc.serviceList.map((item: AutomergeServiceListItem) => item.position))
    : 0;

  handle.change((doc: AutomergeDocument) => {
    if (!doc.serviceList) {
      doc.serviceList = [];
    }
    doc.serviceList.push({
      songId,
      position: maxPosition + 1,
    });
  });

  const updatedDoc = handle.doc();
  const newItem = updatedDoc!.serviceList.find((item: AutomergeServiceListItem) => item.songId === songId)!;
  const updatedSongsMap = updatedDoc!.songs as Record<string, AutomergeSong>;

  return {
    id: songId, // Use songId as stable ID since each song can only appear once
    songId: newItem.songId,
    position: newItem.position,
    song: automergeSongToResponse(updatedSongsMap[songId]),
  };
}

// Remove from service list
export async function removeFromServiceList(
  songId: string,
): Promise<{ success: boolean }> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();

  if (!doc || !doc.serviceList) {
    throw new Error('Song not found in service list');
  }

  const index = doc.serviceList.findIndex((item: AutomergeServiceListItem) => item.songId === songId);
  if (index === -1) {
    throw new Error('Song not found in service list');
  }

  handle.change((doc: AutomergeDocument) => {
    // Filter and create new objects with updated positions to avoid reference issues
    doc.serviceList = doc.serviceList
      .filter((item: AutomergeServiceListItem) => item.songId !== songId)
      .map((item: AutomergeServiceListItem, idx: number) => ({
        songId: item.songId,
        position: idx + 1,
      }));
  });

  return { success: true };
}

// Reorder service list
export async function reorderServiceList(
  songIds: string[],
): Promise<ServiceListSongResponse[]> {
  const handle = await getDocumentHandle();
  const doc = handle.doc();

  if (!doc || !doc.serviceList || !doc.songs) {
    return [];
  }

  handle.change((doc: AutomergeDocument) => {
    // Create a map for quick lookup
    const existingItems = new Map(
      doc.serviceList.map((item: AutomergeServiceListItem) => [item.songId, item])
    );

    // Rebuild service list in the new order
    doc.serviceList = songIds
      .map((songId: string, index: number) => {
        const existing = existingItems.get(songId);
        if (existing) {
          return {
            songId,
            position: index + 1,
          };
        }
        return null;
      })
      .filter((item): item is AutomergeServiceListItem => item !== null);
  });

  return getServiceList();
}

// Clear service list
export async function clearServiceList(): Promise<{ success: boolean }> {
  const handle = await getDocumentHandle();

  handle.change((doc: AutomergeDocument) => {
    if (doc.serviceList) {
      doc.serviceList = [];
    }
  });

  return { success: true };
}

