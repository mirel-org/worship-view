import { ipcRenderer } from 'electron';
import { SongChannels, SongPreloadType } from './song.types';

const songPreload: SongPreloadType = {
  getSongs: () => ipcRenderer.invoke(SongChannels.getSongs),
  getSongContent: (songName: string) =>
    ipcRenderer.invoke(SongChannels.getSongContent, songName),
  saveSong: (songName: string, content: string) =>
    ipcRenderer.invoke(SongChannels.saveSong, songName, content),
  renameSong: (oldName: string, newName: string) =>
    ipcRenderer.invoke(SongChannels.renameSong, oldName, newName),
  deleteSong: (songName: string) =>
    ipcRenderer.invoke(SongChannels.deleteSong, songName),
};

export default songPreload;
