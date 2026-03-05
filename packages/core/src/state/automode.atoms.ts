import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type AutoModeState = 'disabled' | 'listening' | 'tracking' | 'error';

export const autoModeEnabledAtom = atomWithStorage<boolean>(
  'worship-view-automode-enabled',
  false,
);

export const sonioxApiKeyAtom = atomWithStorage<string>(
  'worship-view-soniox-api-key',
  '',
);

export const autoModeDeviceIdAtom = atomWithStorage<string>(
  'worship-view-automode-device-id',
  'default',
);

export const autoModeStateAtom = atom<AutoModeState>('disabled');

export const autoModeLastTranscriptionAtom = atom<string>('');

export const autoModeProgressAtom = atom<number>(0);

/** Per-word match statuses for the current slide (debug overlay) */
export const autoModeWordStatusesAtom = atom<
  ('matched' | 'significant' | 'insignificant')[]
>([]);
