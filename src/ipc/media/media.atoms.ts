import { atom } from 'jotai';
import type { MediaItemResponse } from '@renderer/lib/jazz/media-store';

export const selectedBackgroundMediaItemAtom = atom<MediaItemResponse | null>(null);

// Increment this counter to ask MediaPanel to open the native file picker.
export const mediaUploadPickerRequestAtom = atom(0);
