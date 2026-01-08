import { ipcRenderer } from 'electron';
import { UpdateChannels, UpdatePreloadType, UpdateInfo } from './update.types';

const updatePreload: UpdatePreloadType = {
  checkForUpdates: () => ipcRenderer.invoke(UpdateChannels.checkForUpdates),
  downloadUpdate: () => ipcRenderer.invoke(UpdateChannels.downloadUpdate),
  quitAndInstall: () => ipcRenderer.invoke(UpdateChannels.quitAndInstall),
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: UpdateInfo) => callback(info);
    ipcRenderer.on(UpdateChannels.onUpdateAvailable, handler);
    return () => ipcRenderer.removeListener(UpdateChannels.onUpdateAvailable, handler);
  },
  onUpdateNotAvailable: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(UpdateChannels.onUpdateNotAvailable, handler);
    return () => ipcRenderer.removeListener(UpdateChannels.onUpdateNotAvailable, handler);
  },
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, info: UpdateInfo) => callback(info);
    ipcRenderer.on(UpdateChannels.onUpdateDownloaded, handler);
    return () => ipcRenderer.removeListener(UpdateChannels.onUpdateDownloaded, handler);
  },
  onUpdateError: (callback: (error: Error) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, error: Error) => callback(error);
    ipcRenderer.on(UpdateChannels.onUpdateError, handler);
    return () => ipcRenderer.removeListener(UpdateChannels.onUpdateError, handler);
  },
  onCheckingForUpdate: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(UpdateChannels.onCheckingForUpdate, handler);
    return () => ipcRenderer.removeListener(UpdateChannels.onCheckingForUpdate, handler);
  },
};

export default updatePreload;

