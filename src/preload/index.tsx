import { contextBridge } from 'electron';
import displayPreload from '@ipc/display/display.preload';
import songPreload from '@ipc/song/song.preload';
import { MyAPIType } from '@ipc/index';
import mediaPreload from '@ipc/media/media.preload';

const MyAPI: MyAPIType = {
  ...displayPreload,
  ...songPreload,
  ...mediaPreload,
};

contextBridge.exposeInMainWorld('myAPI', MyAPI);
