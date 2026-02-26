import useGetDisplays from './display/display.hooks';
import { DisplayPreloadType } from './display/display.types';
import { UpdatePreloadType } from './update/update.types';
import { SettingsZoomPreloadType } from './settings/settings.zoom.types';
import { SettingsResetPreloadType } from './settings/settings.reset.types';
import { BackupPreloadType } from './backup/backup.types';
import { MediaCachePreloadType } from './media/media-cache.types';
import {
  useManageProjection,
  useSongShortcuts,
  useVerseShortcuts,
  useProjectionShortcuts,
  useCommandPaletteShortcuts,
  useManageSongs,
  useVersesHistory,
  setMediaCacheApi,
} from '@worship-view/core';
import { useDesktopSettings } from './settings/settings.hooks';
import { useAutoBackup } from './backup/backup.hooks';

export type MyAPIType = DisplayPreloadType &
  UpdatePreloadType &
  SettingsZoomPreloadType &
  SettingsResetPreloadType &
  BackupPreloadType &
  MediaCachePreloadType;

type MainWindow = typeof window & { myAPI: MyAPIType };

export const getApiClient = () => {
  return (window as MainWindow).myAPI;
};

export const useSetup = () => {
  setMediaCacheApi(getApiClient());
  useManageProjection();
  useManageSongs();
  useVersesHistory();
  useGetDisplays();
  useSetupShortcuts();
  useDesktopSettings();
  useAutoBackup();
};

const useSetupShortcuts = () => {
  useVerseShortcuts();
  useSongShortcuts();
  useProjectionShortcuts();
  useCommandPaletteShortcuts();
};
