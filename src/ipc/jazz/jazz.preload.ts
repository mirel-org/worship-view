import { ipcRenderer } from 'electron';
import { JazzChannels, JazzPreloadType } from './jazz.types';

const jazzPreload: JazzPreloadType = {
  getApiKey: () => ipcRenderer.invoke(JazzChannels.getApiKey),
};

export default jazzPreload;

