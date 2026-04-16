import { useState, useEffect, useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { co } from 'jazz-tools';
import * as mediaStore from '../jazz/media-store';
import type { MediaItemResponse } from '../jazz/media-store';
import { useActiveOrganization } from './useActiveOrganization';
import { mediaItemsRefreshTokenAtom } from '../state/media.atoms';
import {
  getCachedBlobUrl,
  setCachedBlobUrl,
  revokeCachedBlobUrl,
  loadFromDiskCache,
  saveToDiskCache,
  deleteFromDiskCache,
} from '../parsers/media-cache';

export function useGetMediaItems() {
  const { activeOrganization } = useActiveOrganization();
  const refreshToken = useAtomValue(mediaItemsRefreshTokenAtom);
  const bumpMediaItemsRefresh = useSetAtom(mediaItemsRefreshTokenAtom);
  const [data, setData] = useState<MediaItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(() => {
    bumpMediaItemsRefresh((n) => n + 1);
  }, [bumpMediaItemsRefresh]);

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
  }, [activeOrganization, refreshToken]);

  return { data, isLoading, error, refresh };
}

export function useUploadMediaItem() {
  const { activeOrganization } = useActiveOrganization();
  const bumpMediaItemsRefresh = useSetAtom(mediaItemsRefreshTokenAtom);
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
        bumpMediaItemsRefresh((n) => n + 1);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload media');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization, bumpMediaItemsRefresh],
  );

  return {
    mutate,
    mutateAsync: mutate,
    isLoading,
    progress,
    error,
  };
}

export function useRenameMediaItem() {
  const { activeOrganization } = useActiveOrganization();
  const bumpMediaItemsRefresh = useSetAtom(mediaItemsRefreshTokenAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ id, newName }: { id: string; newName: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = mediaStore.renameMediaItem(activeOrganization, id, newName);
        bumpMediaItemsRefresh((n) => n + 1);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to rename media');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization, bumpMediaItemsRefresh],
  );

  return {
    mutate,
    mutateAsync: mutate,
    isLoading,
    error,
  };
}

export function useDeleteMediaItem() {
  const { activeOrganization } = useActiveOrganization();
  const bumpMediaItemsRefresh = useSetAtom(mediaItemsRefreshTokenAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (
      id: string,
      streamIds?: { assetId?: string; previewFileStreamId?: string },
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = mediaStore.deleteMediaItem(activeOrganization, id);
        // Clean up both in-memory and disk caches
        if (streamIds?.assetId) {
          const fileStreamId = await mediaStore.loadMediaItemFileStreamId(
            activeOrganization,
            id,
            streamIds.assetId,
          );
          if (fileStreamId) {
            revokeCachedBlobUrl(fileStreamId);
            deleteFromDiskCache(fileStreamId);
          }
        }
        if (streamIds?.previewFileStreamId) {
          revokeCachedBlobUrl(streamIds.previewFileStreamId);
          deleteFromDiskCache(streamIds.previewFileStreamId);
        }
        bumpMediaItemsRefresh((n) => n + 1);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete media');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrganization, bumpMediaItemsRefresh],
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

    // Try disk cache first, then fall back to Jazz
    loadFromDiskCache(fileStreamId)
      .then((diskUrl) => {
        if (cancelled) return;
        if (diskUrl) {
          setBlobUrl(diskUrl);
          setIsLoading(false);
          return;
        }

        // Fall back to Jazz cloud
        co.fileStream()
          .loadAsBlob(fileStreamId)
          .then((blob) => {
            if (cancelled) return;
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCachedBlobUrl(fileStreamId, url);
              setBlobUrl(url);
              // Save to disk cache for next restart (fire-and-forget)
              saveToDiskCache(fileStreamId, blob);
            }
          })
          .catch(() => {
            // Silently fail — URL stays null
          })
          .finally(() => {
            if (!cancelled) setIsLoading(false);
          });
      })
      .catch(() => {
        // Disk cache failed, fall back to Jazz
        co.fileStream()
          .loadAsBlob(fileStreamId)
          .then((blob) => {
            if (cancelled) return;
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCachedBlobUrl(fileStreamId, url);
              setBlobUrl(url);
              saveToDiskCache(fileStreamId, blob);
            }
          })
          .catch(() => {
            // Silently fail
          })
          .finally(() => {
            if (!cancelled) setIsLoading(false);
          });
      });

    return () => {
      cancelled = true;
    };
  }, [fileStreamId]);

  return { blobUrl, isLoading };
}

export function useMediaAssetBlobUrl(assetId: string | undefined) {
  return useMediaItemAssetBlobUrl({
    assetId,
  });
}

export function useMediaItemAssetBlobUrl({
  assetId,
  mediaItemId,
}: {
  assetId?: string;
  mediaItemId?: string;
}) {
  const { activeOrganization } = useActiveOrganization();
  const [fileStreamId, setFileStreamId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!assetId && !mediaItemId) {
      setFileStreamId(undefined);
      return;
    }

    let cancelled = false;
    mediaStore
      .loadMediaItemFileStreamId(activeOrganization, mediaItemId ?? '', assetId)
      .then((loadedFileStreamId) => {
        if (!cancelled) {
          setFileStreamId(loadedFileStreamId ?? undefined);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFileStreamId(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeOrganization, assetId, mediaItemId]);

  return useMediaBlobUrl(fileStreamId);
}

/**
 * Generates JPEG posters for video items missing preview streams.
 * Runs once when the media list loads; refreshes the list when done.
 * Tracks permanently failed items to avoid an infinite retry loop that would
 * re-download full video blobs on every cycle.
 */
export function useMediaPreviewBackfill() {
  const { activeOrganization } = useActiveOrganization();
  const { data: mediaItems, refresh } = useGetMediaItems();
  const inFlightRef = useRef(false);
  const failedIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!activeOrganization || !mediaItems.length) return;
    const needs = mediaItems.filter(
      (m) =>
        m.mediaType === 'video' &&
        !m.previewFileStreamId &&
        !failedIdsRef.current.has(m.id),
    );
    if (needs.length === 0) return;
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    const ac = new AbortController();
    void (async () => {
      try {
        const failed = await mediaStore.backfillVideoPreviews(
          activeOrganization,
          { signal: ac.signal },
        );
        for (const id of failed) {
          failedIdsRef.current.add(id);
        }
        refresh();
      } finally {
        inFlightRef.current = false;
      }
    })();

    return () => {
      ac.abort();
      inFlightRef.current = false;
    };
  }, [activeOrganization, mediaItems, refresh]);
}
