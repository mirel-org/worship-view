export type MediaCacheReadResult = {
  data: ArrayBuffer;
  mimeType: string;
} | null;

export type MediaCachePreloadType = {
  mediaCacheRead: (fileStreamId: string) => Promise<MediaCacheReadResult>;
  mediaCacheWrite: (
    fileStreamId: string,
    data: ArrayBuffer,
    mimeType: string,
  ) => Promise<void>;
  mediaCacheDelete: (fileStreamId: string) => Promise<void>;
};

export const MediaCacheChannels = {
  read: 'media-cache.read',
  write: 'media-cache.write',
  delete: 'media-cache.delete',
};
