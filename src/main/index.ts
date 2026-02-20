import { app, autoUpdater, BrowserWindow, Menu } from 'electron';
import started from 'electron-squirrel-startup';
import { updateElectronApp } from 'update-electron-app';
import { createAppWindow } from './main-window/mainWindow';

const DEFAULT_UPDATE_REPO = 'mirel-org/worship-view';
const UPDATE_REPO = process.env.WV_UPDATE_REPO || DEFAULT_UPDATE_REPO;

// Handle Squirrel.Windows lifecycle events (install/update/uninstall).
// Must be at the top — exits early during Squirrel operations.
if (started) app.quit();

// Allow autoplay without user interaction (needed for video backgrounds)
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Initialize auto-updater in production only
if (app.isPackaged) {
  updateElectronApp({ repo: UPDATE_REPO });
}

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', () => {
  // Set up application menu with "Check for Updates"
  const menu = Menu.buildFromTemplate([
    {
      label: 'Aplicație',
      submenu: [
        {
          label: 'Verifică actualizări',
          click: () => {
            if (app.isPackaged) {
              autoUpdater.checkForUpdates();
            }
          },
        },
        { type: 'separator' },
        { role: 'quit', label: 'Ieșire' },
      ],
    },
    {
      label: 'Editare',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);

  createAppWindow();
});

/**
 * Emitted when the application is activated. Various actions can
 * trigger this event, such as launching the application for the first time,
 * attempting to re-launch the application when it's already running,
 * or clicking on the application's dock or taskbar icon.
 */
app.on('activate', () => {
  /**
   * On OS X it's common to re-create a window in the app when the
   * dock icon is clicked and there are no other windows open.
   */
  if (BrowserWindow.getAllWindows().length === 0) {
    createAppWindow();
  }
});

/**
 * Emitted when all windows have been closed.
 */
app.on('window-all-closed', () => {
  /**
   * On OS X it is common for applications and their menu bar
   * to stay active until the user quits explicitly with Cmd + Q
   */
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * In this file you can include the rest of your app's specific main process code.
 * You can also put them in separate files and import them here.
 */
