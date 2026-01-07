import { useState, useEffect, useCallback } from 'react';
import * as store from '../lib/jazz/store';
import { parseSong } from '../lib/songParser';
import type { Song } from '../../ipc/song/song.types';
import type { ServiceListSongResponse } from '../lib/jazz/store';
import { useActiveOrganization } from './useActiveOrganization';

// Hook to get all songs with Jazz reactive updates
export function useGetSongs() {
  const { activeOrganization } = useActiveOrganization();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeOrganization) {
      setSongs([]);
      setIsLoading(false);
      return;
    }

      try {
        setIsLoading(true);
      const songResponses = store.getSongs(activeOrganization);
          const parsedSongs = songResponses.map((song) =>
            parseSong(song.id, song.name, song.fullText)
          );
          setSongs(parsedSongs);
          setError(null);
      setIsLoading(false);
      } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to load songs'));
          setIsLoading(false);
        }

    // Jazz automatically handles reactivity, but we can re-run when organization changes
    // The organization object itself is reactive, so changes will trigger re-renders
  }, [activeOrganization]);

  return { data: songs, isLoading, error };
}

// Hook to get song content
export function useGetSongContent(id: string) {
  const { activeOrganization } = useActiveOrganization();
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id || !activeOrganization) {
      setIsLoading(false);
      return;
    }

      try {
        setIsLoading(true);
      const songContent = store.getSongContent(activeOrganization, id);
          setContent(songContent);
          setError(null);
      setIsLoading(false);
      } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to load song content'));
          setIsLoading(false);
        }
  }, [id, activeOrganization]);

  return { data: content, isLoading, error };
}

// Hook to save a new song
export function useSaveSong() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ name, content }: { name: string; content: string }) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.saveSong(activeOrganization, name, content);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [activeOrganization]
  );

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to rename a song
export function useRenameSong() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ id, newName }: { id: string; newName: string }) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.renameSong(activeOrganization, id, newName);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to rename song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [activeOrganization]
  );

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to update a song
export function useUpdateSong() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({
      id,
      updates,
    }: {
      id: string;
      updates: { name?: string; fullText?: string };
    }) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.updateSong(activeOrganization, id, updates);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [activeOrganization]
  );

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to delete a song
export function useDeleteSong() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.deleteSong(activeOrganization, id);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete song');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [activeOrganization]
  );

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
  const { activeOrganization } = useActiveOrganization();
  const [serviceList, setServiceList] = useState<ServiceListSongResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeOrganization) {
      setServiceList([]);
      setIsLoading(false);
      return;
    }

      try {
        setIsLoading(true);
      const list = store.getServiceList(activeOrganization);
          setServiceList(list);
          setError(null);
      setIsLoading(false);
      } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to load service list'));
          setIsLoading(false);
        }
  }, [activeOrganization]);

  return { data: serviceList, isLoading, error };
}

// Hook to add to service list
export function useAddToServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (songId: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.addToServiceList(activeOrganization, songId);
      return result;
    } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to add song to service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [activeOrganization]
  );

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to remove from service list
export function useRemoveFromServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (songId: string) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.removeFromServiceList(activeOrganization, songId);
      return result;
    } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to remove song from service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [activeOrganization]
  );

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to reorder service list
export function useReorderServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (songIds: string[]) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.reorderServiceList(activeOrganization, songIds);
      return result;
    } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to reorder service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
    },
    [activeOrganization]
  );

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}

// Hook to clear service list
export function useClearServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = store.clearServiceList(activeOrganization);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error('Failed to clear service list');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}
