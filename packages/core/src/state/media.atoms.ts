import { atom } from 'jotai';
import type { MediaItemResponse } from '../jazz/media-store';

export const selectedBackgroundMediaItemAtom = atom<MediaItemResponse | null>(null);
