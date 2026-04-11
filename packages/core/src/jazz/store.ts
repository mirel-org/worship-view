import { v4 as uuidv4 } from 'uuid';
import {
  Song,
  ServiceListItem,
  ServiceList,
  SongType,
  ServiceListItemType,
  ServiceListType,
  OrganizationType,
} from '@worship-view/schema';
import {
  getOrganizationGroup,
  setCoMapProperty,
  removeCoListItem,
  getSongsArray,
  getServiceListsArray,
  getServiceListItemsArray,
} from '@worship-view/schema';
import { parseSong, reconstructRawText } from '../parsers/songParser';
import type { Song as ParsedSong } from '../types/song.types';

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
    key: song.key ?? undefined,
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

// Helper to get all service lists from organization
function getServiceListsFromOrg(
  organization: OrganizationType | null | undefined,
): ServiceListType[] {
  const lists = getServiceListsArray(organization);
  return lists.filter(
    (list: ServiceListType | null): list is ServiceListType => list !== null,
  );
}

// Helper to find a service list by its id
function findServiceList(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
): ServiceListType {
  const lists = getServiceListsFromOrg(organization);
  const list = lists.find((l) => l.id === serviceListId);
  if (!list) {
    throw new Error('Service list not found');
  }
  return list;
}

// Helper to get items from a specific service list
function getItemsFromServiceList(
  serviceList: ServiceListType,
): ServiceListItemType[] {
  const items = getServiceListItemsArray(serviceList);
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
  key?: string,
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
      ...(key ? { key } : {}),
      searchText: parsed.fullText, // Store normalized search text
    },
    { owner: orgGroup },
  );

  if (!organization.songs) {
    throw new Error('Organization songs not loaded');
  }
  (organization.songs.$jazz as any).push(newSong);

  const response = songToResponse(newSong);
  if (!response) throw new Error('Failed to create song response');
  return response;
}

// Update song in organization
export function updateSong(
  organization: OrganizationType | null | undefined,
  id: string,
  updates: { name?: string; fullText?: string; key?: string },
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
  if (updates.key !== undefined) {
    setCoMapProperty(song, 'key', updates.key || undefined);
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

  // Remove from all service lists if present
  const allLists = getServiceListsFromOrg(organization);
  for (const serviceList of allLists) {
    const items = getItemsFromServiceList(serviceList);
    const serviceItem = items.find(
      (item: ServiceListItemType) => item.songId === id,
    );
    if (serviceItem && serviceList.items) {
      removeCoListItem(
        serviceList.items,
        (item: ServiceListItemType | null) => item?.songId === id,
      );
      const remainingItems = getItemsFromServiceList(serviceList);
      remainingItems.forEach((item: ServiceListItemType, index: number) => {
        setCoMapProperty(item, 'position', index + 1);
      });
    }
  }

  return { success: true };
}

// Batch upsert songs
export interface BatchUpsertSong {
  name: string;
  fullText: string;
  key?: string;
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

  if (!organization.songs) {
    throw new Error('Organization songs not loaded');
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
        if (songData.key !== undefined) {
          setCoMapProperty(existingSong, 'key', songData.key || undefined);
        }
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
            ...(songData.key ? { key: songData.key } : {}),
          },
          { owner: orgGroup },
        );
        (organization.songs.$jazz as any).push(newSong);
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

  // Clear all service lists' items
  const allLists = getServiceListsFromOrg(organization);
  for (const serviceList of allLists) {
    if (serviceList.items) {
      const items = getItemsFromServiceList(serviceList);
      items.forEach((item: ServiceListItemType) => {
        removeCoListItem(
          serviceList.items,
          (i: ServiceListItemType | null) => i?.songId === item.songId,
        );
      });
    }
  }

  return {
    success: true,
    deletedCount: count,
  };
}

// Service List Management Functions

export interface ServiceListResponse {
  id: string;
  name: string;
}

// Get all service lists (metadata only)
export function getAllServiceLists(
  organization: OrganizationType | null | undefined,
): ServiceListResponse[] {
  const lists = getServiceListsFromOrg(organization);
  return lists.map((list) => ({
    id: list.id,
    name: list.name,
  }));
}

// Create a new service list
export function createServiceList(
  organization: OrganizationType | null | undefined,
  name: string,
): ServiceListResponse {
  if (!organization) {
    throw new Error('No active organization');
  }
  if (!organization.serviceLists) {
    throw new Error('Organization service lists not loaded');
  }

  const orgGroup = getOrganizationGroup(organization);
  const id = uuidv4();

  const newList = ServiceList.create(
    {
      id,
      name,
      items: [],
    },
    { owner: orgGroup },
  );

  (organization.serviceLists.$jazz as any).push(newList);

  return { id, name };
}

// Rename a service list
export function renameServiceList(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
  newName: string,
): ServiceListResponse {
  const list = findServiceList(organization, serviceListId);
  setCoMapProperty(list, 'name', newName);
  return { id: list.id, name: newName };
}

// Delete a service list
export function deleteServiceList(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  removeCoListItem(
    organization.serviceLists,
    (list: ServiceListType | null) => list?.id === serviceListId,
  );

  return { success: true };
}

// Service List Item Functions

// Get items for a specific service list
export function getServiceListItems(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
): ServiceListSongResponse[] {
  const list = findServiceList(organization, serviceListId);
  const items = getItemsFromServiceList(list);
  const songs = getSongsFromOrg(organization);

  return items
    .sort((a, b) => a.position - b.position)
    .map((item) => {
      const song = songs.find((s) => s.id === item.songId);
      if (!song) return null;
      const songResponse = songToResponse(song);
      if (!songResponse) return null;
      return {
        id: item.songId,
        songId: item.songId,
        position: item.position,
        song: songResponse,
      };
    })
    .filter((item): item is ServiceListSongResponse => item !== null);
}

// Add a song to a specific service list
export function addToServiceList(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
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

  const list = findServiceList(organization, serviceListId);
  if (!list.items) {
    throw new Error('Service list items not loaded');
  }

  const items = getItemsFromServiceList(list);
  const existing = items.find(
    (item: ServiceListItemType) => item.songId === songId,
  );
  if (existing) {
    throw new Error('Song is already in the service list');
  }

  const maxPosition =
    items.length > 0
      ? Math.max(...items.map((item) => item.position))
      : 0;

  const orgGroup = getOrganizationGroup(organization);
  const newItem = ServiceListItem.create(
    { songId, position: maxPosition + 1 },
    { owner: orgGroup },
  );

  (list.items.$jazz as any).push(newItem);

  const songResponse = songToResponse(song);
  if (!songResponse) throw new Error('Failed to create song response');
  return {
    id: songId,
    songId: newItem.songId,
    position: newItem.position,
    song: songResponse,
  };
}

// Remove a song from a specific service list
export function removeFromServiceList(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
  songId: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const list = findServiceList(organization, serviceListId);
  const items = getItemsFromServiceList(list);
  const item = items.find(
    (item: ServiceListItemType) => item.songId === songId,
  );

  if (!item) {
    throw new Error('Song not found in service list');
  }

  removeCoListItem(
    list.items,
    (i: ServiceListItemType | null) => i?.songId === songId,
  );

  const remainingItems = getItemsFromServiceList(list);
  remainingItems.forEach((item: ServiceListItemType, index: number) => {
    setCoMapProperty(item, 'position', index + 1);
  });

  return { success: true };
}

// Reorder items within a specific service list
export function reorderServiceList(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
  songIds: string[],
): ServiceListSongResponse[] {
  if (!organization) {
    throw new Error('No active organization');
  }

  const list = findServiceList(organization, serviceListId);
  const items = getItemsFromServiceList(list);
  const existingItems = new Map(items.map((item) => [item.songId, item]));
  const orgGroup = getOrganizationGroup(organization);

  // Remove all existing items
  if (list.items) {
    items.forEach((item: ServiceListItemType) => {
      removeCoListItem(
        list.items,
        (i: ServiceListItemType | null) => i?.songId === item.songId,
      );
    });
  }

  // Re-add in new order
  songIds.forEach((songId: string, index: number) => {
    const existing = existingItems.get(songId);
    if (existing) {
      const newItem = ServiceListItem.create(
        { songId, position: index + 1 },
        { owner: orgGroup },
      );
      if (!list.items) {
        throw new Error('Service list items not loaded');
      }
      (list.items.$jazz as any).push(newItem);
    }
  });

  return getServiceListItems(organization, serviceListId);
}

// Clear all items from a specific service list
export function clearServiceList(
  organization: OrganizationType | null | undefined,
  serviceListId: string,
): { success: boolean } {
  if (!organization) {
    throw new Error('No active organization');
  }

  const list = findServiceList(organization, serviceListId);
  if (list.items) {
    const items = getItemsFromServiceList(list);
    items.forEach((item: ServiceListItemType) => {
      removeCoListItem(
        list.items,
        (i: ServiceListItemType | null) => i?.songId === item.songId,
      );
    });
  }

  return { success: true };
}
