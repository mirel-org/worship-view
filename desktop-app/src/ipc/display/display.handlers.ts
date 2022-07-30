import { ipcMain, screen } from "electron";
import { DisplayChannels } from "./display.types";

const displayHandlers = () => {
  ipcMain.handle(DisplayChannels.getDisplays, async () => {
    return screen.getAllDisplays();
  });
};

export default displayHandlers;
