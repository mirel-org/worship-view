import { atomWithStorage } from 'jotai/utils';

export type AppTheme = 'dark' | 'light';
export type AppZoomLevel = 80 | 90 | 100 | 110 | 125 | 150;

export const settingsThemeAtom = atomWithStorage<AppTheme>(
  'settings-theme',
  'dark',
);

export const settingsZoomLevelAtom = atomWithStorage<AppZoomLevel>(
  'settings-zoom-level',
  100,
);
