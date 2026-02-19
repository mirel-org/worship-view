import { contextBridge } from 'electron';
import displayPreload from '@ipc/display/display.preload';
import updatePreload from '@ipc/update/update.preload';
import settingsZoomPreload from '@ipc/settings/settings.zoom.preload';
import { MyAPIType } from '@ipc/index';

const MyAPI: MyAPIType = {
  ...displayPreload,
  ...updatePreload,
  ...settingsZoomPreload,
};

contextBridge.exposeInMainWorld('myAPI', MyAPI);
