import { ipcRenderer } from 'electron';
import {
  SettingsZoomChannels,
  SettingsZoomPreloadType,
} from './settings.zoom.types';

const settingsZoomPreload: SettingsZoomPreloadType = {
  setZoomFactor: (zoomFactor) =>
    ipcRenderer.invoke(SettingsZoomChannels.setZoomFactor, zoomFactor),
};

export default settingsZoomPreload;
