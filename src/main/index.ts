// Load environment variables from .env file
import dotenv from 'dotenv';
import path from 'path';
import { app, BrowserWindow, protocol } from 'electron';

// Load .env file from project root
// Try multiple possible locations
const possiblePaths = [
  path.join(process.cwd(), '.env'), // Project root (most common)
  path.join(__dirname, '../../.env'), // Relative to built file location
];

for (const envPath of possiblePaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    break; // Successfully loaded
  }
}
import { fileHandler } from './main-window/fileProtocol';
import { createAppWindow } from './main-window/mainWindow';

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.on('ready', () => {
  protocol.registerFileProtocol(
    'local-files',
    fileHandler,
  );
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
