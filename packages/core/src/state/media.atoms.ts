import { atom } from 'jotai';
import type { MediaItemResponse } from '../jazz/media-store';

/** Increment to force all `useGetMediaItems` instances to re-read from the store (e.g. after preview backfill). */
export const mediaItemsRefreshTokenAtom = atom(0);

export const selectedBackgroundMediaItemAtom = atom<MediaItemResponse | null>(null);
