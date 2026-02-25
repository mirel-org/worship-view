import { ipcRenderer } from 'electron';
import {
  SettingsResetChannels,
  SettingsResetPreloadType,
} from './settings.reset.types';

const settingsResetPreload: SettingsResetPreloadType = {
  resetLocalStateAndRestart: () =>
    ipcRenderer.invoke(SettingsResetChannels.resetLocalStateAndRestart),
};

export default settingsResetPreload;
