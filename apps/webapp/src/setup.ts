import {
  useManageProjection,
  useSongShortcuts,
  useVerseShortcuts,
  useProjectionShortcuts,
  useCommandPaletteShortcuts,
  useAutoModeShortcuts,
  useManageSongs,
  useVersesHistory,
  useThemeSettings,
} from '@worship-view/core';

export const useWebappSetup = () => {
  useManageProjection();
  useManageSongs();
  useVersesHistory();
  useSetupShortcuts();
  useThemeSettings();
};

const useSetupShortcuts = () => {
  useVerseShortcuts();
  useSongShortcuts();
  useProjectionShortcuts();
  useCommandPaletteShortcuts();
  useAutoModeShortcuts();
};
