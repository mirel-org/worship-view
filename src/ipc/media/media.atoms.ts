import { atom } from 'jotai';
import type { MediaItemResponse } from '@renderer/lib/jazz/media-store';

export const selectedBackgroundMediaItemAtom = atom<MediaItemResponse | null>(null);
