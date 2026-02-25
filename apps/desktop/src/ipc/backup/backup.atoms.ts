import { atomWithStorage } from 'jotai/utils';

export const lastBackupTimestampAtom = atomWithStorage<string | null>(
  'worship-view-last-backup',
  null,
);
