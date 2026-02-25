import {
  useManageProjection,
  useSongShortcuts,
  useVerseShortcuts,
  useProjectionShortcuts,
  useCommandPaletteShortcuts,
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
};
