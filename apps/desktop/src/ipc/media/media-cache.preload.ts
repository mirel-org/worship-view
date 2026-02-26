import { ipcRenderer } from 'electron';
import { MediaCacheChannels, MediaCachePreloadType } from './media-cache.types';

const mediaCachePreload: MediaCachePreloadType = {
  mediaCacheRead: (fileStreamId: string) =>
    ipcRenderer.invoke(MediaCacheChannels.read, fileStreamId),
  mediaCacheWrite: (fileStreamId: string, data: ArrayBuffer, mimeType: string) =>
    ipcRenderer.invoke(MediaCacheChannels.write, fileStreamId, data, mimeType),
  mediaCacheDelete: (fileStreamId: string) =>
    ipcRenderer.invoke(MediaCacheChannels.delete, fileStreamId),
};

export default mediaCachePreload;
