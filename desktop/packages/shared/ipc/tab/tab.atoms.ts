import { atom } from 'jotai';
import { TabType } from '@renderer/components/tabs/Tabs';

export const selectedTabTypeAtom = atom<TabType>('songs');
