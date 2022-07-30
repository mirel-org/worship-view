import { ipcRenderer } from 'electron';
import { SongChannels, SongPreloadType } from './song.types';

const songPreload: SongPreloadType = {
  getSongs: () => ipcRenderer.invoke(SongChannels.getSongs),
};

export default songPreload;
