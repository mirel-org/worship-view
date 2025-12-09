import displayHandlers from '@ipc/display/display.handlers';
import mediaHandlers from '@ipc/media/media.handlers';
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
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load the index.html of the app window.
  if (APP_WINDOW_VITE_DEV_SERVER_URL) {
    appWindow.loadURL(APP_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    appWindow.loadFile(path.join(__dirname, `../renderer/${APP_WINDOW_VITE_NAME}/index.html`));
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
  mediaHandlers();
}
