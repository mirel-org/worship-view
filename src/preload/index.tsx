import { contextBridge } from 'electron';
import displayPreload from '@ipc/display/display.preload';
import updatePreload from '@ipc/update/update.preload';
import settingsZoomPreload from '@ipc/settings/settings.zoom.preload';
import settingsResetPreload from '@ipc/settings/settings.reset.preload';
import backupPreload from '@ipc/backup/backup.preload';
import { MyAPIType } from '@ipc/index';

const MyAPI: MyAPIType = {
  ...displayPreload,
  ...updatePreload,
  ...settingsZoomPreload,
  ...settingsResetPreload,
  ...backupPreload,
};

contextBridge.exposeInMainWorld('myAPI', MyAPI);
