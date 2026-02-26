type MediaCacheApi = {
  mediaCacheRead: (fileStreamId: string) => Promise<{ data: ArrayBuffer; mimeType: string } | null>;
  mediaCacheWrite: (fileStreamId: string, data: ArrayBuffer, mimeType: string) => Promise<void>;
  mediaCacheDelete: (fileStreamId: string) => Promise<void>;
};

let _api: MediaCacheApi | null = null;

export function setMediaCacheApi(api: MediaCacheApi): void {
  _api = api;
}

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
  if (!_api) return null;
  try {
    const result = await _api.mediaCacheRead(fileStreamId);
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
  if (!_api) return;
  const api = _api;
  blob
    .arrayBuffer()
    .then((buffer) => {
      api.mediaCacheWrite(fileStreamId, buffer, blob.type);
    })
    .catch(() => {
      // Best-effort — fail silently
    });
}

export function deleteFromDiskCache(fileStreamId: string): void {
  if (!_api) return;
  _api
    .mediaCacheDelete(fileStreamId)
    .catch(() => {
      // Best-effort — fail silently
    });
}
