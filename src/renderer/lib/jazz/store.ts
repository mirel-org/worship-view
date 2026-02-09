import { v4 as uuidv4 } from 'uuid';
import {
  Song,
  ServiceListItem,
  SongType,
  ServiceListItemType,
  OrganizationType,
} from './schema';
import {
  getOrganizationGroup,
  setCoMapProperty,
  pushCoListItem,
  removeCoListItem,
  getSongsArray,
  getServiceListArray,
} from './helpers';
import { parseSong, reconstructRawText } from '../songParser';
import type { Song as ParsedSong } from '@ipc/song/song.types';

// Response type matching parsed Song structure
export type SongResponse = ParsedSong;

export interface ServiceListSongResponse {
  id: string;
  songId: string;
  position: number;
  song: SongResponse;
}

// Convert Jazz Song to SongResponse (parsed structure)
function songToResponse(
  song: SongType | null | undefined,
): SongResponse | null {
  if (!song) return null;
  return {
    id: song.id,
    name: song.name,
    parts: song.parts,
    arrangement: song.arrangement,
    fullText: song.searchText, // Use searchText as fullText for search compatibility
  };
}

// Helper to get songs from organization
function getSongsFromOrg(
  organization: OrganizationType | null | undefined,
): SongType[] {
  const songs = getSongsArray(organization);
  return songs.filter(
    (song: SongType | null): song is SongType => song !== null,
  );
}

// Helper to get service list from organization
function getServiceListFromOrg(
  organization: OrganizationType | null | undefined,
): ServiceListItemType[] {
  const items = getServiceListArray(organization);
  return items.filter(
    (item: ServiceListItemType | null): item is ServiceListItemType =>
      item !== null,
  );
}

// Get all songs from organization
export function getSongs(
  organization: OrganizationType | null | undefined,
): SongResponse[] {
  const songs = getSongsFromOrg(organization);
  return songs
    .map((song) => songToResponse(song))
    .filter((s): s is SongResponse => s !== null);
}

// Get song by ID from organization (returns parsed structure)
export function getSongById(
  organization: OrganizationType | null | undefined,
  id: string,
): SongResponse {
  const songs = getSongsFromOrg(organization);
  const song = songs.find((s) => s.id === id);
  if (!song) {
    throw new Error('Song not found');
  }
  const response = songToResponse(song);
  if (!response) {
    throw new Error('Song not found');
  }
  return response;
}

// Get song content (reconstructed raw text for editing)
export function getSongContent(
  organization: OrganizationType | null | undefined,
  id: string,
): string {
  const songs = getSongsFromOrg(organization);
  const song = songs.find((s) => s.id === id);
  if (!song) {
    throw new Error('Song not found');
  }
  // Reconstruct raw text from parsed data
  return reconstructRawText({
    parts: song.parts,
    arrangement: song.arrangement,
  });
}

// Save new song to organization
export function saveSong(
  organization: OrganizationType | null | undefined,
  name: string,
  content: string,
): SongResponse {
  if (!organization) {
    throw new Error('No active organization');
  }

  const id = uuidv4();

  // Parse the raw content to get structured data
  const parsed = parseSong(id, name, content);

  // Get the organization's owner group (for permissions)
  // Items in the organization should use the same group
  const orgGroup = getOrganizationGroup(organization);

  // Create new song with parsed data
  const newSong = Song.create(
    {
      id,
      name,
      parts: parsed.parts,
      arrangement: parsed.arrangement,
      searchText: parsed.fullText, // Store normalized search text
    },
    { owner: orgGroup },
  );

  // Ensure songs list exists and add to it
  if (!organization.songs) {
    setCoMapProperty(organization, 'songs', []);
  }
  pushCoListItem(organization.songs, newSong);

  const response = songToResponse(newSong);
  if (!response) throw new Error('Failed to create song response');
  return response;
}

// Update song in organization
export function updateSong(
  organization: OrganizationType | null | undefined,
  id: string,
  updates: { name?: string; fullText?: string },
): SongResponse {
  if (!organization) {
    throw new Error('No active organization');
  }

  const songs = getSongsFromOrg(organization);
  const song = songs.find((s: SongType) => s.id === id);

  if (!song) {
    throw new Error('Song not found');
  }

  // Use $jazz.set to update properties (Jazz CoValues are immutable)
  if (updates.name !== undefined) {
    setCoMapProperty(song, 'name', updates.name);
  }
  if (updates.fullText !== undefined) {
    // Parse the raw text to get structured data
    const parsed = parseSong(song.id, updates.name || song.name, updates.fullText);
    setCoMapProperty(song, 'parts', parsed.parts);
    setCoMapProperty(song, 'arrangement', parsed.arrangement);
    setCoMapProperty(song, 'searchText', parsed.fullText); // Update normalized search text
  }

  const response = songToResponse(song);
  if (!response) throw new Error('Failed to create song response');
  return response;
}

// Rename song
export function renameSong(
  organization: OrganizationType | null | undefined,
  id: string,
  newName: string,
): SongResponse {
  return updateSong(organization, id, { name: newName });
}

// Delete song from organization
export function deleteSong(
  organization: OrganizationType | null | undefined,
  id: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const songs = getSongsFromOrg(organization);
  const song = songs.find((s: SongType) => s.id === id);

  if (!song) {
    throw new Error('Song not found');
  }

  // Remove from songs list
  removeCoListItem(organization.songs, (s: SongType | null) => s?.id === id);

  // Also remove from service list if present
  const serviceList = getServiceListFromOrg(organization);
  const serviceItem = serviceList.find(
    (item: ServiceListItemType) => item.songId === id,
  );
  if (serviceItem && organization.serviceList) {
    removeCoListItem(
      organization.serviceList,
      (item: ServiceListItemType | null) => item?.songId === id,
    );
    // Reorder remaining items
    const remainingItems = getServiceListFromOrg(organization);
    remainingItems.forEach((item: ServiceListItemType, index: number) => {
      setCoMapProperty(item, 'position', index + 1);
    });
  }

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
  updated: number;
  errorCount: number;
  results: SongResponse[];
  errors?: Array<{ name: string; error: string }>;
}

export function batchUpsertSongs(
  organization: OrganizationType | null | undefined,
  songs: BatchUpsertSong[],
): BatchUpsertResponse {
  if (!organization) {
    throw new Error('No active organization');
  }

  const results: SongResponse[] = [];
  const errors: Array<{ name: string; error: string }> = [];
  let createdCount = 0;
  let updatedCount = 0;

  // Ensure songs list exists
  if (!organization.songs) {
    setCoMapProperty(organization, 'songs', []);
  }

  for (const songData of songs) {
    try {
      if (!songData.name || !songData.fullText) {
        errors.push({
          name: songData.name || 'unknown',
          error: 'Name and fullText are required',
        });
        continue;
      }

      // Parse the raw text to get structured data
      const id = uuidv4();
      const parsed = parseSong(id, songData.name, songData.fullText);

      // Check if song with same name exists
      const existingSongs = getSongsFromOrg(organization);
      const existingSong = existingSongs.find((s) => s.name === songData.name);

      if (existingSong) {
        // Update existing song with parsed data
        setCoMapProperty(existingSong, 'parts', parsed.parts);
        setCoMapProperty(existingSong, 'arrangement', parsed.arrangement);
        setCoMapProperty(existingSong, 'searchText', parsed.fullText);
        const response = songToResponse(existingSong);
        if (response) {
          results.push(response);
          updatedCount++;
        }
      } else {
        // Create new song with parsed data
        const orgGroup = getOrganizationGroup(organization);
        const newSong = Song.create(
          {
            id,
            name: songData.name,
            parts: parsed.parts,
            arrangement: parsed.arrangement,
            searchText: parsed.fullText,
          },
          { owner: orgGroup },
        );
        pushCoListItem(organization.songs, newSong);
        const response = songToResponse(newSong);
        if (response) {
          results.push(response);
          createdCount++;
        }
      }
    } catch (error: any) {
      errors.push({
        name: songData.name,
        error: error.message || 'Unknown error',
      });
    }
  }

  return {
    success: true,
    created: createdCount,
    updated: updatedCount,
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

export function deleteAllSongs(
  organization: OrganizationType | null | undefined,
): DeleteAllResponse {
  if (!organization) {
    throw new Error('No active organization');
  }

  const songs = getSongsFromOrg(organization);
  const count = songs.length;

  // Clear songs list by removing all items
  if (organization.songs) {
    const songs = getSongsFromOrg(organization);
    songs.forEach((song: SongType) => {
      removeCoListItem(organization.songs, (s: SongType | null) => s?.id === song.id);
    });
  }

  // Clear service list by removing all items
  if (organization.serviceList) {
    const items = getServiceListFromOrg(organization);
    items.forEach((item: ServiceListItemType) => {
      removeCoListItem(
        organization.serviceList,
        (i: ServiceListItemType | null) => i?.songId === item.songId,
      );
    });
  }

  return {
    success: true,
    deletedCount: count,
  };
}

// Service List Functions

// Get service list from organization
export function getServiceList(
  organization: OrganizationType | null | undefined,
): ServiceListSongResponse[] {
  const serviceList = getServiceListFromOrg(organization);
  const songs = getSongsFromOrg(organization);

  return serviceList
    .sort((a, b) => a.position - b.position)
    .map((item) => {
      const song = songs.find((s) => s.id === item.songId);
      if (!song) {
        // Song was deleted but still in service list, skip it
        return null;
      }
      const songResponse = songToResponse(song);
      if (!songResponse) {
        return null;
      }
      return {
        id: item.songId, // Use songId as stable ID since each song can only appear once
        songId: item.songId,
        position: item.position,
        song: songResponse,
      };
    })
    .filter((item): item is ServiceListSongResponse => item !== null);
}

// Add to service list
export function addToServiceList(
  organization: OrganizationType | null | undefined,
  songId: string,
): ServiceListSongResponse {
  if (!organization) {
    throw new Error('No active organization');
  }

  const songs = getSongsFromOrg(organization);
  const song = songs.find((s: SongType) => s.id === songId);

  if (!song) {
    throw new Error('Song not found');
  }

  // Ensure service list exists
  if (!organization.serviceList) {
    setCoMapProperty(organization, 'serviceList', []);
  }

  // Check if already in service list
  const serviceList = getServiceListFromOrg(organization);
  const existing = serviceList.find(
    (item: ServiceListItemType) => item.songId === songId,
  );
  if (existing) {
    throw new Error('Song is already in the service list');
  }

  const maxPosition =
    serviceList.length > 0
      ? Math.max(...serviceList.map((item) => item.position))
      : 0;

  // Get the organization's owner group
  const orgGroup = getOrganizationGroup(organization);

  // Create new service list item with organization's group as owner
  const newItem = ServiceListItem.create(
    {
      songId,
      position: maxPosition + 1,
    },
    { owner: orgGroup },
  );

  // Add to service list
  pushCoListItem(organization.serviceList, newItem);

  const songResponse = songToResponse(song);
  if (!songResponse) throw new Error('Failed to create song response');
  return {
    id: songId,
    songId: newItem.songId,
    position: newItem.position,
    song: songResponse,
  };
}

// Remove from service list
export function removeFromServiceList(
  organization: OrganizationType | null | undefined,
  songId: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const serviceList = getServiceListFromOrg(organization);
  const item = serviceList.find(
    (item: ServiceListItemType) => item.songId === songId,
  );

  if (!item) {
    throw new Error('Song not found in service list');
  }

  // Remove from service list
  removeCoListItem(
    organization.serviceList,
    (i: ServiceListItemType | null) => i?.songId === songId,
  );

  // Reorder positions
  const remainingItems = getServiceListFromOrg(organization);
  remainingItems.forEach((item: ServiceListItemType, index: number) => {
    setCoMapProperty(item, 'position', index + 1);
  });

  return { success: true };
}

// Reorder service list
export function reorderServiceList(
  organization: OrganizationType | null | undefined,
  songIds: string[],
): ServiceListSongResponse[] {
  if (!organization) {
    throw new Error('No active organization');
  }

  const serviceList = getServiceListFromOrg(organization);

  // Create a map for quick lookup
  const existingItems = new Map(serviceList.map((item) => [item.songId, item]));

  // Clear and rebuild service list in the new order
  const orgGroup = getOrganizationGroup(organization);

  if (organization.serviceList) {
    const items = getServiceListFromOrg(organization);
    items.forEach((item: ServiceListItemType) => {
      removeCoListItem(
        organization.serviceList,
        (i: ServiceListItemType | null) => i?.songId === item.songId,
      );
    });
  }

  songIds.forEach((songId: string, index: number) => {
    const existing = existingItems.get(songId);
    if (existing) {
      const newItem = ServiceListItem.create(
        {
          songId,
          position: index + 1,
        },
        { owner: orgGroup },
      );
      if (!organization.serviceList) {
        setCoMapProperty(organization, 'serviceList', []);
      }
      pushCoListItem(organization.serviceList, newItem);
    }
  });

  return getServiceList(organization);
}

// Clear service list
export function clearServiceList(
  organization: OrganizationType | null | undefined,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  if (organization.serviceList) {
    const items = getServiceListFromOrg(organization);
    items.forEach((item: ServiceListItemType) => {
      removeCoListItem(
        organization.serviceList,
        (i: ServiceListItemType | null) => i?.songId === item.songId,
      );
    });
  }

  return { success: true };
}
