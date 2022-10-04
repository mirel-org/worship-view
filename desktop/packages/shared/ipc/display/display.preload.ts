import { ipcRenderer } from "electron";
import { DisplayChannels, DisplayPreloadType } from "./display.types";

const displayPreload: DisplayPreloadType = {
  getDisplays: () => ipcRenderer.invoke(DisplayChannels.getDisplays),
};

export default displayPreload;
