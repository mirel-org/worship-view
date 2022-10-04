import { ipcRenderer } from 'electron';
import { MediaChannels, MediaPreloadType } from './media.types';

const mediaPreload: MediaPreloadType = {
  getMediaItems: () => ipcRenderer.invoke(MediaChannels.getMediaItems),
};

export default mediaPreload;
