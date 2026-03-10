import { contextBridge } from 'electron';
import displayPreload from '../ipc/display/display.preload';
import updatePreload from '../ipc/update/update.preload';
import settingsZoomPreload from '../ipc/settings/settings.zoom.preload';
import settingsResetPreload from '../ipc/settings/settings.reset.preload';
import backupPreload from '../ipc/backup/backup.preload';
import mediaCachePreload from '../ipc/media/media-cache.preload';
import presentationPreload from '../ipc/presentation/presentation.preload';
import { MyAPIType } from '../ipc/index';

const MyAPI: MyAPIType = {
  ...displayPreload,
  ...updatePreload,
  ...settingsZoomPreload,
  ...settingsResetPreload,
  ...backupPreload,
  ...mediaCachePreload,
  ...presentationPreload,
};

contextBridge.exposeInMainWorld('myAPI', MyAPI);
