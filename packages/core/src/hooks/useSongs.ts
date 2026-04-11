import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import * as store from '../jazz/store';
import type { Song } from '../types/song.types';
import type { ServiceListSongResponse, ServiceListResponse } from '../jazz/store';
import { useActiveOrganization } from './useActiveOrganization';

let songsDataRevision = 0;
const songsDataListeners = new Set<() => void>();

const notifySongsDataChanged = () => {
  songsDataRevision += 1;
  songsDataListeners.forEach((listener) => listener());
};

const subscribeToSongsData = (listener: () => void) => {
  songsDataListeners.add(listener);
  return () => songsDataListeners.delete(listener);
};

const getSongsDataRevision = () => songsDataRevision;

const useSongsDataRevision = () =>
  useSyncExternalStore(
    subscribeToSongsData,
    getSongsDataRevision,
    getSongsDataRevision,
  );

// Hook to get all songs with Jazz reactive updates
// Songs are already parsed in the store, so no parsing needed here
export function useGetSongs() {
  const { activeOrganization } = useActiveOrganization();
  const revision = useSongsDataRevision();
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
      // Songs are already parsed in the store, use directly
      const parsedSongs = store.getSongs(activeOrganization);
      setSongs(parsedSongs);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load songs'));
      setIsLoading(false);
    }

    // Jazz automatically handles reactivity, but we can re-run when organization changes
    // The organization object itself is reactive, so changes will trigger re-renders
  }, [activeOrganization, revision]);

  return { data: songs, isLoading, error };
}

// Hook to get song content
export function useGetSongContent(id: string) {
  const { activeOrganization } = useActiveOrganization();
  const revision = useSongsDataRevision();
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
  }, [id, activeOrganization, revision]);

  return { data: content, isLoading, error };
}

// Hook to save a new song
export function useSaveSong() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ name, content, key }: { name: string; content: string; key?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.saveSong(activeOrganization, name, content, key);
      notifySongsDataChanged();
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
      notifySongsDataChanged();
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
      updates: { name?: string; fullText?: string; key?: string };
    }) => {
    setIsLoading(true);
    setError(null);
    try {
        const result = store.updateSong(activeOrganization, id, updates);
      notifySongsDataChanged();
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
      notifySongsDataChanged();
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

// Service List Management Hooks

// Hook to get all service lists (metadata)
export function useGetServiceLists() {
  const { activeOrganization } = useActiveOrganization();
  const revision = useSongsDataRevision();
  const [serviceLists, setServiceLists] = useState<ServiceListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeOrganization) {
      setServiceLists([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const lists = store.getAllServiceLists(activeOrganization);
      setServiceLists(lists);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load service lists'));
      setIsLoading(false);
    }
  }, [activeOrganization, revision]);

  return { data: serviceLists, isLoading, error };
}

// Hook to create a new service list
export function useCreateServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (name: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.createServiceList(activeOrganization, name);
        notifySongsDataChanged();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to create service list');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization],
  );

  return { mutateAsync: mutate, mutate, isLoading, error };
}

// Hook to rename a service list
export function useRenameServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ serviceListId, newName }: { serviceListId: string; newName: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.renameServiceList(activeOrganization, serviceListId, newName);
        notifySongsDataChanged();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to rename service list');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization],
  );

  return { mutateAsync: mutate, mutate, isLoading, error };
}

// Hook to delete a service list
export function useDeleteServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (serviceListId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.deleteServiceList(activeOrganization, serviceListId);
        notifySongsDataChanged();
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete service list');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization],
  );

  return { mutateAsync: mutate, mutate, isLoading, error };
}

// Service List Item Hooks

// Hook to get items for a specific service list
export function useGetServiceListItems(serviceListId: string | null) {
  const { activeOrganization } = useActiveOrganization();
  const revision = useSongsDataRevision();
  const [serviceList, setServiceList] = useState<ServiceListSongResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeOrganization || !serviceListId) {
      setServiceList([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const list = store.getServiceListItems(activeOrganization, serviceListId);
      setServiceList(list);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load service list'));
      setIsLoading(false);
    }
  }, [activeOrganization, serviceListId, revision]);

  return { data: serviceList, isLoading, error };
}

// Hook to add to a specific service list
export function useAddToServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ serviceListId, songId }: { serviceListId: string; songId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.addToServiceList(activeOrganization, serviceListId, songId);
        notifySongsDataChanged();
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
    [activeOrganization],
  );

  return { mutateAsync: mutate, mutate, isLoading, error };
}

// Hook to remove from a specific service list
export function useRemoveFromServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ serviceListId, songId }: { serviceListId: string; songId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.removeFromServiceList(activeOrganization, serviceListId, songId);
        notifySongsDataChanged();
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
    [activeOrganization],
  );

  return { mutateAsync: mutate, mutate, isLoading, error };
}

// Hook to reorder a specific service list
export function useReorderServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ serviceListId, songIds }: { serviceListId: string; songIds: string[] }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.reorderServiceList(activeOrganization, serviceListId, songIds);
        notifySongsDataChanged();
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
    [activeOrganization],
  );

  return { mutateAsync: mutate, mutate, isLoading, error };
}

// Hook to clear a specific service list
export function useClearServiceList() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (serviceListId: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.clearServiceList(activeOrganization, serviceListId);
        notifySongsDataChanged();
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to clear service list');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization],
  );

  return { mutateAsync: mutate, mutate, isLoading, error };
}

// Hook to delete all songs from an organization
export function useDeleteAllSongs() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (organization: any) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = store.deleteAllSongs(organization);
        notifySongsDataChanged();
        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to delete all songs');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    mutateAsync: mutate,
    mutate,
    isLoading,
    error,
  };
}
