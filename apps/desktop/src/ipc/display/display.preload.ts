import { Display, ipcRenderer } from "electron";
import { DisplayChannels, DisplayPreloadType } from "./display.types";

const displayPreload: DisplayPreloadType = {
  getDisplays: () => ipcRenderer.invoke(DisplayChannels.getDisplays),
  getMainWindowDisplayId: () => ipcRenderer.invoke(DisplayChannels.getMainWindowDisplayId),
  onDisplaysChanged: (callback: (displays: Display[]) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, displays: Display[]) => {
      callback(displays);
    };
    ipcRenderer.on(DisplayChannels.displaysChanged, handler);
    return () => {
      ipcRenderer.removeListener(DisplayChannels.displaysChanged, handler);
    };
  },
};

export default displayPreload;
