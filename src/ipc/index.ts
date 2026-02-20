import useGetDisplays from './display/display.hooks';
import { DisplayPreloadType } from './display/display.types';
import { UpdatePreloadType } from './update/update.types';
import { SettingsZoomPreloadType } from './settings/settings.zoom.types';
import { SettingsResetPreloadType } from './settings/settings.reset.types';
import { useManageProjection } from './projection/projection.hooks';
import useProjectionShortcuts from './projection/projection.shortcuts';
import { useSettings } from './settings/settings.hooks';
import { useManageSongs } from './song/song.hooks';
import useSongShortcuts from './song/song.shortcuts';
import { useVersesHistory } from './verse/verse.hooks';
import useVerseShortcuts from './verse/verse.shortcuts';
import { useCommandPaletteShortcuts } from './command/command.shortcuts';

export type MyAPIType = DisplayPreloadType &
  UpdatePreloadType &
  SettingsZoomPreloadType &
  SettingsResetPreloadType;

type MainWindow = typeof window & { myAPI: MyAPIType };

export const getApiClient = () => {
  return (window as MainWindow).myAPI;
};

export const useSetup = () => {
  useManageProjection();
  useManageSongs();
  useVersesHistory();
  useGetDisplays();
  useSetupShortcuts();
  useSettings();
};

const useSetupShortcuts = () => {
  useVerseShortcuts();
  useSongShortcuts();
  useProjectionShortcuts();
  useCommandPaletteShortcuts();
};
