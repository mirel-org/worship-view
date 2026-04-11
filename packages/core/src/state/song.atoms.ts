import { atom } from 'jotai';

// Local-only UI state — remains in Jotai
export const songInputValueAtom = atom<string>('');
export const songInputFocusAtom = atom<boolean>(false);
