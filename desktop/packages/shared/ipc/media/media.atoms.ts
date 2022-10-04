import { atom } from "jotai";
import { MediaItem } from "./media.types";

export const selectedBackgroundMediaItemAtom = atom<MediaItem | null>(null);
