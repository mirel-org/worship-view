import { Display } from "electron";
import { atom } from "jotai";

export const availableDisplaysAtom = atom<Display[]>([]);
