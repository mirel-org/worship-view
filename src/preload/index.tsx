import { contextBridge } from 'electron';
import displayPreload from '@ipc/display/display.preload';
import { MyAPIType } from '@ipc/index';

const MyAPI: MyAPIType = {
  ...displayPreload,
};

contextBridge.exposeInMainWorld('myAPI', MyAPI);
