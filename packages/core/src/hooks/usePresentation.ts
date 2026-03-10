import { useState, useEffect, useCallback } from 'react';
import * as presentationStore from '../jazz/presentation-store';
import type { PresentationResponse, UploadSlideInput } from '../jazz/presentation-store';
import { useActiveOrganization } from './useActiveOrganization';
import { useMediaBlobUrl } from './useMedia';

export function useGetPresentations() {
  const { activeOrganization } = useActiveOrganization();
  const [data, setData] = useState<PresentationResponse[]>([]);
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
      const items = presentationStore.getPresentations(activeOrganization);
      setData(items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load presentations'));
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization]);

  return { data, isLoading, error };
}

export function useUploadPresentation() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (name: string, slides: UploadSlideInput[]) => {
      setIsLoading(true);
      setProgress(0);
      setError(null);
      try {
        const result = await presentationStore.uploadPresentation(
          activeOrganization,
          name,
          slides,
          (p) => setProgress(p),
        );
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to upload presentation');
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

export function useRenamePresentation() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ id, newName }: { id: string; newName: string }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = presentationStore.renamePresentation(activeOrganization, id, newName);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to rename presentation');
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

export function useDeletePresentation() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = presentationStore.deletePresentation(activeOrganization, id);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete presentation');
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

export function useDeletePresentationSlide() {
  const { activeOrganization } = useActiveOrganization();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async ({ presentationId, slideIndex }: { presentationId: string; slideIndex: number }) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = presentationStore.deletePresentationSlide(
          activeOrganization,
          presentationId,
          slideIndex,
        );
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to delete slide');
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

export function usePresentationSlideBlobUrl(fileStreamId: string | undefined) {
  return useMediaBlobUrl(fileStreamId);
}
