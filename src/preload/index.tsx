import { contextBridge } from 'electron';
import displayPreload from '@ipc/display/display.preload';
import { MyAPIType } from '@ipc/index';
import mediaPreload from '@ipc/media/media.preload';
import jazzPreload from '@ipc/jazz/jazz.preload';

const MyAPI: MyAPIType = {
  ...displayPreload,
  ...mediaPreload,
  ...jazzPreload,
};

contextBridge.exposeInMainWorld('myAPI', MyAPI);
