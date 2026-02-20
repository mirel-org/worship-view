import displayHandlers from '@ipc/display/display.handlers';
import updateHandlers from '@ipc/update/update.handlers';
import settingsZoomHandlers from '@ipc/settings/settings.zoom.handlers';
import settingsResetHandlers from '@ipc/settings/settings.reset.handlers';
import { app, BrowserWindow } from 'electron';
import path from 'path';

// Electron Forge automatically creates these entry points for Vite
declare const APP_WINDOW_VITE_DEV_SERVER_URL: string;
declare const APP_WINDOW_VITE_NAME: string;

let appWindow: BrowserWindow | null;

/**
 * Create Application Window
 * @returns {BrowserWindow} Application Window Instance
 */
export function createAppWindow(): BrowserWindow {
  // Resolve paths correctly for both development and production
  const getPreloadPath = () => {
    if (app.isPackaged) {
      // In production, app.getAppPath() returns the path to app.asar
      // Electron automatically handles reading files from inside asar archives
      const appPath = app.getAppPath();
      return path.join(appPath, '.vite/build/preload.js');
    }
    // In development, __dirname points to .vite/build/ where main.js is located
    // preload.js is in the same directory
    return path.join(__dirname, 'preload.js');
  };

  const getIndexPath = () => {
    if (app.isPackaged) {
      const appPath = app.getAppPath();
      return path.join(appPath, `.vite/renderer/${APP_WINDOW_VITE_NAME}/index.html`);
    }
    // In development, __dirname is .vite/build/, so go up one level to .vite/
    // then into renderer/app_window/
    return path.join(__dirname, `../renderer/${APP_WINDOW_VITE_NAME}/index.html`);
  };

  // Create new window instance
  appWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: path.resolve('assets/images/appIcon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      nodeIntegrationInWorker: false,
      nodeIntegrationInSubFrames: false,
      preload: getPreloadPath(),
    },
  });

  // Load the index.html of the app window.
  if (APP_WINDOW_VITE_DEV_SERVER_URL) {
    appWindow.loadURL(APP_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    appWindow.loadFile(getIndexPath());
  }

  // Show window when its ready to
  appWindow.on('ready-to-show', () => appWindow && appWindow.show());

  // Register Inter Process Communication for main process
  registerMainIPC();

  // Close all windows when main window is closed
  appWindow.on('close', () => {
    appWindow = null;
    app.quit();
  });

  return appWindow;
}

/**
 * Register Inter Process Communication
 */
function registerMainIPC() {
  /**
   * Here you can assign IPC related codes for the application window
   * to Communicate asynchronously from the main process to renderer processes.
   */
  displayHandlers();
  updateHandlers();
  settingsZoomHandlers();
  settingsResetHandlers();
}
