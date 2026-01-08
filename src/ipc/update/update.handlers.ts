import { ipcMain, autoUpdater } from 'electron';
import { UpdateChannels } from './update.types';
import { initializeUpdater } from '../../main/updater';

let updaterInitialized = false;

const updateHandlers = () => {
  // Initialize updater on first handler registration
  if (!updaterInitialized) {
    initializeUpdater();
    updaterInitialized = true;
  }

  ipcMain.handle(UpdateChannels.checkForUpdates, async () => {
    // Use Electron's built-in autoUpdater (used by update-electron-app)
    // checkForUpdates() returns void, not a Promise
    autoUpdater.checkForUpdates();
  });

  ipcMain.handle(UpdateChannels.downloadUpdate, async () => {
    // Manual trigger for checking/downloading updates
    // Note: Downloads happen automatically when update-available fires,
    // but this handler allows manual checks from the UI
    autoUpdater.checkForUpdates();
  });

  ipcMain.handle(UpdateChannels.quitAndInstall, async () => {
    // Quit and install the downloaded update
    autoUpdater.quitAndInstall();
  });
};

export default updateHandlers;

