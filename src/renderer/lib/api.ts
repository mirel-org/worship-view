import { API_BASE_URL } from '../config/api';

export interface SongResponse {
  id: number;
  name: string;
  fullText: string;
}

export async function getSongs(): Promise<SongResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/songs`);
  if (!response.ok) {
    throw new Error(`Failed to fetch songs: ${response.statusText}`);
  }
  return response.json();
}

export async function getSongById(id: number): Promise<SongResponse> {
  const response = await fetch(`${API_BASE_URL}/api/songs/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Song not found');
    }
    throw new Error(`Failed to fetch song: ${response.statusText}`);
  }
  return response.json();
}

export async function getSongContent(id: number): Promise<string> {
  const song = await getSongById(id);
  return song.fullText;
}

export async function saveSong(
  name: string,
  content: string,
): Promise<SongResponse> {
  const response = await fetch(`${API_BASE_URL}/api/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, fullText: content }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to save song: ${response.statusText}`,
    );
  }

  return response.json();
}

export async function updateSong(
  id: number,
  updates: { name?: string; fullText?: string },
): Promise<SongResponse> {
  const response = await fetch(`${API_BASE_URL}/api/songs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to update song: ${response.statusText}`,
    );
  }

  return response.json();
}

export async function renameSong(
  id: number,
  newName: string,
): Promise<SongResponse> {
  return updateSong(id, { name: newName });
}

export async function deleteSong(id: number): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/songs/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to delete song: ${response.statusText}`,
    );
  }

  return response.json();
}

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
  const response = await fetch(`${API_BASE_URL}/api/songs/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ songs }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to batch upsert songs: ${response.statusText}`,
    );
  }

  return response.json();
}

export interface DeleteAllResponse {
  success: boolean;
  deletedCount: number;
}

export async function deleteAllSongs(): Promise<DeleteAllResponse> {
  const response = await fetch(`${API_BASE_URL}/api/songs`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to delete all songs: ${response.statusText}`,
    );
  }

  return response.json();
}

// Service List API
export interface ServiceListSongResponse {
  id: number;
  songId: number;
  position: number;
  song: SongResponse;
}

export async function getServiceList(): Promise<ServiceListSongResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/service-list`);
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to fetch service list: ${response.statusText}`,
    );
  }
  return response.json();
}

export async function addToServiceList(
  songId: number,
): Promise<ServiceListSongResponse> {
  const response = await fetch(`${API_BASE_URL}/api/service-list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ songId }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to add song to service list: ${response.statusText}`,
    );
  }

  return response.json();
}

export async function removeFromServiceList(
  songId: number,
): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/service-list/${songId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to remove song from service list: ${response.statusText}`,
    );
  }

  return response.json();
}

export async function reorderServiceList(
  songIds: number[],
): Promise<ServiceListSongResponse[]> {
  const response = await fetch(`${API_BASE_URL}/api/service-list/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ songIds }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to reorder service list: ${response.statusText}`,
    );
  }

  return response.json();
}

export async function clearServiceList(): Promise<{ success: boolean }> {
  const response = await fetch(`${API_BASE_URL}/api/service-list`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(
      error.error || `Failed to clear service list: ${response.statusText}`,
    );
  }

  return response.json();
}
