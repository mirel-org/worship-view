import useGetDisplays from './display/display.hooks';
import { DisplayPreloadType } from './display/display.types';
import { UpdatePreloadType } from './update/update.types';
import { SettingsZoomPreloadType } from './settings/settings.zoom.types';
import { SettingsResetPreloadType } from './settings/settings.reset.types';
import { BackupPreloadType } from './backup/backup.types';
import { MediaCachePreloadType } from './media/media-cache.types';
import { PresentationPreloadType } from './presentation/presentation.types';
import {
  useManageProjection,
  useSongShortcuts,
  useVerseShortcuts,
  useProjectionShortcuts,
  useCommandPaletteShortcuts,
  useAutoModeShortcuts,
  useManageSongs,
  useManagePresentations,
  usePresentationShortcuts,
  useVersesHistory,
  setMediaCacheApi,
  setVideoEnabled,
  useAutoMode,
} from '@worship-view/core';
import { useDesktopSettings } from './settings/settings.hooks';
import { useAutoBackup } from './backup/backup.hooks';

export type MyAPIType = DisplayPreloadType &
  UpdatePreloadType &
  SettingsZoomPreloadType &
  SettingsResetPreloadType &
  BackupPreloadType &
  MediaCachePreloadType &
  PresentationPreloadType;

type MainWindow = typeof window & { myAPI: MyAPIType };

export const getApiClient = () => {
  return (window as MainWindow).myAPI;
};

export const useSetup = () => {
  setVideoEnabled(true);
  setMediaCacheApi(getApiClient());
  useManageProjection();
  useManageSongs();
  useManagePresentations();
  useVersesHistory();
  useGetDisplays();
  useSetupShortcuts();
  useDesktopSettings();
  useAutoBackup();
  useAutoMode();
};

const useSetupShortcuts = () => {
  useVerseShortcuts();
  useSongShortcuts();
  usePresentationShortcuts();
  useProjectionShortcuts();
  useCommandPaletteShortcuts();
  useAutoModeShortcuts();
};
