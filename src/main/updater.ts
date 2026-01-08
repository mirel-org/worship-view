import { app, BrowserWindow, autoUpdater } from 'electron';
import { UpdateChannels } from '../ipc/update/update.types';

// Only enable updates on Windows (macOS requires code signing)
// update-electron-app works with Squirrel.Windows, so no NSIS needed!
const isUpdateEnabled = process.platform === 'win32' && app.isPackaged;

let updaterInitialized = false;

export function initializeUpdater() {
  if (!isUpdateEnabled || updaterInitialized) {
    return;
  }

  updaterInitialized = true;

  // Initialize update-electron-app
  // This uses update.electronjs.org service which reads from GitHub Releases
  // Repository is auto-detected from package.json
  // According to Electron docs: https://www.electronjs.org/docs/latest/tutorial/updates#using-updateelectronjsorg
  const { updateElectronApp } = require('update-electron-app');
  updateElectronApp({
    // Disable automatic notifications - we'll use our custom dialog
    notifyUser: false,
    // Check for updates every 10 minutes (default)
    updateInterval: '10 minutes',
  });

  // Note: Electron's built-in autoUpdater (used by update-electron-app) automatically
  // downloads updates when they're found. The download starts immediately when
  // update-available fires, and we show progress in our custom dialog.

  // Set up event listeners on Electron's built-in autoUpdater
  // update-electron-app uses the standard autoUpdater module under the hood
  autoUpdater.on('checking-for-update', () => {
    // Send event to all windows
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(UpdateChannels.onCheckingForUpdate);
    });
  });

  autoUpdater.on('update-available', () => {
    // Send event to all windows
    // Note: Electron's built-in autoUpdater doesn't provide version info in the event
    // We'll send a basic update info object
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(UpdateChannels.onUpdateAvailable, {
        version: 'unknown',
        releaseDate: new Date().toISOString(),
      });
    });
  });

  autoUpdater.on('update-not-available', () => {
    // Send event to all windows
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(UpdateChannels.onUpdateNotAvailable);
    });
  });

  autoUpdater.on('update-downloaded', () => {
    // Send event to all windows
    // Note: Electron's built-in autoUpdater doesn't provide version info in the event
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(UpdateChannels.onUpdateDownloaded, {
        version: 'unknown',
        releaseDate: new Date().toISOString(),
      });
    });
  });

  autoUpdater.on('error', (error) => {
    // Send event to all windows
    BrowserWindow.getAllWindows().forEach((window) => {
      window.webContents.send(UpdateChannels.onUpdateError, error);
    });
  });
}

export function checkForUpdatesOnStartup() {
  if (!isUpdateEnabled) {
    return;
  }

  // update-electron-app automatically checks for updates on startup
  // But we can also manually trigger a check after a delay
  setTimeout(() => {
    try {
      autoUpdater.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates on startup:', error);
    }
  }, 5000);
}
