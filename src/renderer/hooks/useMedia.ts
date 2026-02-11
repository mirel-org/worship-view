import { useState, useEffect, useCallback } from 'react';
import { co } from 'jazz-tools';
import * as mediaStore from '../lib/jazz/media-store';
import type { MediaItemResponse } from '../lib/jazz/media-store';
import { useActiveOrganization } from './useActiveOrganization';
import {
  getCachedBlobUrl,
  setCachedBlobUrl,
} from '../lib/media-cache';

export function useGetMediaItems() {
  const { activeOrganization } = useActiveOrganization();
  const [data, setData] = useState<MediaItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!activeOrganization) {
      setData([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const items = mediaStore.getMediaItems(activeOrganization);
      setData(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load media items'));
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  return { data, isLoading, error };
}

export function useUploadMediaItem() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setProgress(0);
      setError(null);
      try {
        const result = await mediaStore.uploadMediaItem(
          activeOrganization,
          file,
          (p) => setProgress(p),
        );
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload media');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization],
  );

  return {
    mutate,
    mutateAsync: mutate,
    isLoading,
    progress,
    error,
  };
}

export function useDeleteMediaItem() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = mediaStore.deleteMediaItem(activeOrganization, id);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete media');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization],
  );

  return {
    mutate,
    mutateAsync: mutate,
    isLoading,
    error,
  };
}

export function useMediaBlobUrl(fileStreamId: string | undefined) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!fileStreamId) {
      setBlobUrl(null);
      return;
    }

    // Check cache first
    const cached = getCachedBlobUrl(fileStreamId);
    if (cached) {
      setBlobUrl(cached);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    co.fileStream()
      .loadAsBlob(fileStreamId)
      .then((blob) => {
        if (cancelled) return;
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCachedBlobUrl(fileStreamId, url);
          setBlobUrl(url);
        }
      })
      .catch(() => {
        // Silently fail — URL stays null
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fileStreamId]);

  return { blobUrl, isLoading };
}
