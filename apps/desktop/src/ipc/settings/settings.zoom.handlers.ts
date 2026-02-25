import { BrowserWindow, ipcMain } from 'electron';
import { SettingsZoomChannels } from './settings.zoom.types';

const settingsZoomHandlers = () => {
  ipcMain.handle(SettingsZoomChannels.setZoomFactor, (event, zoomFactor) => {
    const currentWindow = BrowserWindow.fromWebContents(event.sender);
    if (!currentWindow) return;

    const safeZoomFactor = Math.min(1.5, Math.max(0.8, Number(zoomFactor) || 1));
    currentWindow.webContents.setZoomFactor(safeZoomFactor);
  });
};

export default settingsZoomHandlers;
