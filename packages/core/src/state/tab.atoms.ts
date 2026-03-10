import { atom } from 'jotai';

export type TabType = 'songs' | 'bible' | 'presentations';

export const selectedTabTypeAtom = atom<TabType>('songs');
