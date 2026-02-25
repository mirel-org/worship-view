import { ipcRenderer } from 'electron';
import { UpdateChannels, UpdatePreloadType } from './update.types';

const updatePreload: UpdatePreloadType = {
  checkForUpdates: () => ipcRenderer.invoke(UpdateChannels.checkForUpdates),
  getDownloadedUpdateState: () =>
    ipcRenderer.invoke(UpdateChannels.getDownloadedUpdateState),
  installDownloadedUpdate: () =>
    ipcRenderer.invoke(UpdateChannels.installDownloadedUpdate),
};

export default updatePreload;
