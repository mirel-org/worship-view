import { getApiClient } from '@ipc/index';

const blobUrlCache = new Map<string, string>();

export function getCachedBlobUrl(fileStreamId: string): string | undefined {
  return blobUrlCache.get(fileStreamId);
}

export function setCachedBlobUrl(fileStreamId: string, url: string): void {
  blobUrlCache.set(fileStreamId, url);
}

export function revokeCachedBlobUrl(fileStreamId: string): void {
  const url = blobUrlCache.get(fileStreamId);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(fileStreamId);
  }
}

export async function loadFromDiskCache(
  fileStreamId: string,
): Promise<string | null> {
  try {
    const result = await getApiClient().mediaCacheRead(fileStreamId);
    if (!result) return null;
    const blob = new Blob([result.data], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    setCachedBlobUrl(fileStreamId, url);
    return url;
  } catch {
    return null;
  }
}

export function saveToDiskCache(fileStreamId: string, blob: Blob): void {
  blob
    .arrayBuffer()
    .then((buffer) => {
      getApiClient().mediaCacheWrite(fileStreamId, buffer, blob.type);
    })
    .catch(() => {
      // Best-effort — fail silently
    });
}

export function deleteFromDiskCache(fileStreamId: string): void {
  getApiClient()
    .mediaCacheDelete(fileStreamId)
    .catch(() => {
      // Best-effort — fail silently
    });
}
