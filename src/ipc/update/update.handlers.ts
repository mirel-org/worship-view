import { autoUpdater, ipcMain } from 'electron';
import { UpdateChannels } from './update.types';

const updateHandlers = () => {
  ipcMain.handle(UpdateChannels.checkForUpdates, async () => {
    autoUpdater.checkForUpdates();
  });
};

export default updateHandlers;
