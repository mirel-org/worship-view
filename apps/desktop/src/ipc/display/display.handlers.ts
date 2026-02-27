import { ipcMain, screen } from "electron";
import { DisplayChannels } from "./display.types";
import { getAppWindow } from "../../main/main-window/mainWindow";

const broadcastDisplays = () => {
  const mainWindow = getAppWindow();
  if (!mainWindow) return;
  mainWindow.webContents.send(
    DisplayChannels.displaysChanged,
    screen.getAllDisplays(),
  );
};

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

  screen.on("display-added", broadcastDisplays);
  screen.on("display-removed", broadcastDisplays);
  screen.on("display-metrics-changed", broadcastDisplays);
};

export default displayHandlers;
