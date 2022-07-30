import { atom } from 'jotai';
import { SongSlideSize } from './settings.song.types';

export const settingsSongSlideSizeAtom = atom<SongSlideSize>(4);
