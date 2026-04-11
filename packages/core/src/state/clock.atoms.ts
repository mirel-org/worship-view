import { atomWithStorage } from 'jotai/utils';

export type ClockFormat = '12h' | '24h';
export type ClockPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
export type ClockFontSize = 100 | 150 | 200 | 250 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const clockOverlayEnabledAtom = atomWithStorage<boolean>(
  'worship-view-clock-enabled',
  false,
);

export const clockFormatAtom = atomWithStorage<ClockFormat>(
  'worship-view-clock-format',
  '24h',
);

export const clockPositionAtom = atomWithStorage<ClockPosition>(
  'worship-view-clock-position',
  'bottom-left',
);

export const clockFontSizeAtom = atomWithStorage<ClockFontSize>(
  'worship-view-clock-font-size',
  300,
);
