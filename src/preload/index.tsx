import { contextBridge } from 'electron';
import displayPreload from '@ipc/display/display.preload';
import { MyAPIType } from '@ipc/index';
import mediaPreload from '@ipc/media/media.preload';
import gdrivePreload from '@ipc/gdrive/gdrive.preload';

const MyAPI: MyAPIType = {
  ...displayPreload,
  ...mediaPreload,
  ...gdrivePreload,
};

contextBridge.exposeInMainWorld('myAPI', MyAPI);
