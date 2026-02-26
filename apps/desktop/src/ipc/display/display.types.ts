import { Display } from "electron";

export type DisplayPreloadType = {
  getDisplays: () => Promise<Display[]>;
  getMainWindowDisplayId: () => Promise<number>;
};

export const DisplayChannels = {
  getDisplays: "display.get-displays",
  getMainWindowDisplayId: "display.get-main-window-display-id",
}
