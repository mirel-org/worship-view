import { atomWithStorage } from 'jotai/utils';

export const selectedTextStyleIdAtom = atomWithStorage<string | null>(
  'worship-view-selected-text-style-id',
  null,
);
