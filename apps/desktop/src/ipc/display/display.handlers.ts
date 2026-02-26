import { ipcMain, screen } from "electron";
import { DisplayChannels } from "./display.types";
import { getAppWindow } from "../../main/main-window/mainWindow";

const displayHandlers = () => {
  ipcMain.handle(DisplayChannels.getDisplays, async () => {
    return screen.getAllDisplays();
  });

  ipcMain.handle(DisplayChannels.getMainWindowDisplayId, async () => {
    const mainWindow = getAppWindow();
    if (!mainWindow) return -1;
    const bounds = mainWindow.getBounds();
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    const display = screen.getDisplayNearestPoint({ x: centerX, y: centerY });
    return display.id;
  });
};

export default displayHandlers;
