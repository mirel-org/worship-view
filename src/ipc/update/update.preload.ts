import { ipcRenderer } from 'electron';
import { UpdateChannels, UpdatePreloadType } from './update.types';

const updatePreload: UpdatePreloadType = {
  checkForUpdates: () => ipcRenderer.invoke(UpdateChannels.checkForUpdates),
};

export default updatePreload;
