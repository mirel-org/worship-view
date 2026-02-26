import { Display } from "electron";

export type DisplayPreloadType = {
  getDisplays: () => Promise<Display[]>
};

export const DisplayChannels = {
  getDisplays: "display.get-displays"
}
