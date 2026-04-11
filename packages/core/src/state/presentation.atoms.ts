import { atom } from 'jotai';

// Local-only UI state — remains in Jotai
export const presentationInputFocusAtom = atom<boolean>(false);

// Video control - state feedback atoms (audience → operator, local only)
export const videoCurrentTimeAtom = atom<number>(0);
export const videoDurationAtom = atom<number>(0);
