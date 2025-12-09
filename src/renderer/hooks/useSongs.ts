import { useState, useEffect, useCallback } from 'react';
import { getDocumentHandle } from '../lib/automerge/repo';
import * as store from '../lib/automerge/store';
import { parseSong } from '../lib/songParser';
import type { Song } from '@ipc/song/song.types';
import type { ServiceListSongResponse } from '../lib/automerge/store';

// Hook to get all songs with Automerge subscription
export function useGetSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSongs() {
      try {
        setIsLoading(true);
        const songResponses = await store.getSongs();
        if (mounted) {
          const parsedSongs = songResponses.map((song) =>
            parseSong(song.id, song.name, song.fullText)
          );
          setSongs(parsedSongs);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load songs'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    // Initial load
    loadSongs();

    // Subscribe to document changes
    let handle: Awaited<ReturnType<typeof getDocumentHandle>> | null = null;
    let onChange: (() => void) | null = null;
    
    async function subscribe() {
      try {
        handle = await getDocumentHandle();
        
        // Subscribe to changes
        onChange = () => {
          console.log('Document changed, reloading songs...');
          if (mounted) {
            // Reload songs when document changes
            loadSongs();
          }
        };
        
        // Subscribe to change events
        handle.on('change', onChange);
        
        // Ensure document is ready, then load songs
        handle.whenReady().then(() => {
          if (mounted) {
            loadSongs();
          }
        });
      } catch (err) {
        console.error('Failed to subscribe to document changes:', err);
      }
    }

    subscribe();

    return () => {
      mounted = false;
      // Unsubscribe from change events
      if (handle && onChange) {
        handle.off('change', onChange);
      }
    };
  }, []);

  return { data: songs, isLoading, error };
}

// Hook to get song content
export function useGetSongContent(id: string) {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadContent() {
      try {
        setIsLoading(true);
        const songContent = await store.getSongContent(id);
        if (mounted) {
          setContent(songContent);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load song content'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadContent();

    // Subscribe to document changes
    let handle: Awaited<ReturnType<typeof getDocumentHandle>> | null = null;
    let onChange: (() => void) | null = null;
    
    async function subscribe() {
      try {
        handle = await getDocumentHandle();
        onChange = () => {
          if (mounted) {
            loadContent();
          }
        };
        handle.on('change', onChange);
      } catch (err) {
        console.error('Failed to subscribe to document changes:', err);
      }
    }

    subscribe();

    return () => {
      mounted = false;
      // Unsubscribe from change events
      if (handle && onChange) {
        handle.off('change', onChange);
      }
    };
  }, [id]);

  return { data: content, isLoading, error };
}

// Hook to save a new song
export function useSaveSong() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async ({ name, content }: { name: string; content: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.saveSong(name, content);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to rename a song
export function useRenameSong() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async ({ id, newName }: { id: string; newName: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.renameSong(id, newName);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to rename song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to update a song
export function useUpdateSong() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async ({ id, updates }: { id: string; updates: { name?: string; fullText?: string } }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.updateSong(id, updates);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to delete a song
export function useDeleteSong() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.deleteSong(id);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Service List Hooks

// Hook to get service list
export function useGetServiceList() {
  const [serviceList, setServiceList] = useState<ServiceListSongResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadServiceList() {
      try {
        setIsLoading(true);
        const list = await store.getServiceList();
        if (mounted) {
          setServiceList(list);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load service list'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadServiceList();

    // Subscribe to document changes
    let handle: Awaited<ReturnType<typeof getDocumentHandle>> | null = null;
    let onChange: (() => void) | null = null;
    
    async function subscribe() {
      try {
        handle = await getDocumentHandle();
        onChange = () => {
          if (mounted) {
            loadServiceList();
          }
        };
        handle.on('change', onChange);
      } catch (err) {
        console.error('Failed to subscribe to document changes:', err);
      }
    }

    subscribe();

    return () => {
      mounted = false;
      // Unsubscribe from change events
      if (handle && onChange) {
        handle.off('change', onChange);
      }
    };
  }, []);

  return { data: serviceList, isLoading, error };
}

// Hook to add to service list
export function useAddToServiceList() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (songId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.addToServiceList(songId);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to add song to service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to remove from service list
export function useRemoveFromServiceList() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (songId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.removeFromServiceList(songId);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to remove song from service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to reorder service list
export function useReorderServiceList() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (songIds: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.reorderServiceList(songIds);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reorder service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to clear service list
export function useClearServiceList() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await store.clearServiceList();
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to clear service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}
