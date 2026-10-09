import { atomWithStorage } from 'jotai/utils';

export type ClockFormat = '12h' | '24h';
export type ClockPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type ClockFontSize =
  | 100 | 150 | 200 | 250 | 300 | 400 | 500 | 600 | 700 | 800 | 900
  | 1000 | 1200 | 1500 | 2000 | 2500;
export type ClockColorMode = 'style' | 'custom';

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

/** 'style' follows the active text style's font colour, 'custom' uses clockCustomColorAtom */
export const clockColorModeAtom = atomWithStorage<ClockColorMode>(
  'worship-view-clock-color-mode',
  'style',
);

export const clockCustomColorAtom = atomWithStorage<string>(
  'worship-view-clock-custom-color',
  '#ffffff',
);
