import { atom } from 'jotai';
import { SongSlideSize } from '../types/settings.song.types';

export const settingsSongSlideSizeAtom = atom<SongSlideSize>(4);
