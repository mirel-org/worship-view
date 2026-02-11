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
