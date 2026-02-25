import { atom } from 'jotai';

export type TabType = 'songs' | 'bible';

export const selectedTabTypeAtom = atom<TabType>('songs');
