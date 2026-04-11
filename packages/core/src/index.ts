// State (atoms)
export { selectedSongAtom, selectedSongTextAtom, selectedSongSlideReferenceAtom, selectedSongSlideAtom, nextSongSlideAtom, songInputValueAtom, songInputFocusAtom, totalSongSlidesAtom, currentSongSlideNumberAtom, selectedSongKeyAtom } from './state/song.atoms';
export { selectedVerseReferenceAtom, selectedVerseTextAtom, verseInputReferenceAtom, verseInputValueAtom, verseInputFocusAtom, versesHistoryAtom } from './state/verse.atoms';
export { currentProjectionTypeAtom, verseProjectionEnabledAtom } from './state/projection.atoms';
export { prayerRequestsAtom, prayerRequestFontSizeAtom } from './state/prayer.atoms';
export { selectedBackgroundMediaItemAtom } from './state/media.atoms';
export { selectedPresentationAtom, selectedPresentationSlideIndexAtom, selectedPresentationSlideAtom, totalPresentationSlidesAtom, presentationInputFocusAtom, videoPlayingAtom, videoVolumeAtom, videoSeekRequestAtom, videoCurrentTimeAtom, videoDurationAtom } from './state/presentation.atoms';
export { areScreensEnabledAtom } from './state/screen.atoms';
export { selectedTabTypeAtom } from './state/tab.atoms';
export type { TabType } from './state/tab.atoms';
export { commandPaletteOpenAtom, commandPaletteSearchAtom, commandPaletteResultsAtom } from './state/command.atoms';
export type { CommandPaletteResultType, CommandAction, CommandPaletteResult } from './state/command.atoms';
export { jazzApiKeyAtom, passphraseConfirmedByAccountAtom, activeOrgIdAtom } from './state/jazz.atoms';
export { areSettingsOpenAtom } from './state/settings.atoms';
export { selectedTextStyleIdAtom } from './state/text-style.atoms';
export { sidebarOpenAtom } from './state/sidebar.atoms';
export { openSidebar, closeSidebar } from './components/layout/Sidebar';
export { settingsThemeAtom, settingsZoomLevelAtom } from './state/settings.theme.atoms';
export type { AppTheme, AppZoomLevel } from './state/settings.theme.atoms';
export { settingsSongSlideSizeAtom } from './state/settings.song.atoms';
export { autoModeEnabledAtom, autoModeStateAtom, autoModeLastTranscriptionAtom, autoModeProgressAtom, autoModeWordStatusesAtom, sonioxApiKeyAtom, autoModeDeviceIdAtom, autoModeOperatorOnlyAtom, autoModeSuggestedSlideRefAtom } from './state/automode.atoms';
export type { AutoModeState } from './state/automode.atoms';

// Types
export type { Song, SongPart, SongSlide, SongArrangement } from './types/song.types';
export type { BibleReferenceType, BibleTextType } from './types/verse.types';
export type { ProjectionType } from './types/projection.types';
export type { SongSlideSize } from './types/settings.song.types';
export type { PresentationData, PresentationSlideData } from './types/presentation.types';

// State hooks
export { useSongControll, useManageSongs } from './state-hooks/song.hooks';
export { useVerseControll, useVersesHistory } from './state-hooks/verse.hooks';
export { useManageProjection } from './state-hooks/projection.hooks';
export { usePresentationControl, useManagePresentations } from './state-hooks/presentation.hooks';
export { useCommandPaletteSearch, MIN_SONG_SEARCH_LENGTH } from './state-hooks/command.hooks';
export { useThemeSettings } from './state-hooks/settings.theme.hooks';
export { useAutoMode } from './state-hooks/automode.hooks';

// Shortcuts
export { default as useSongShortcuts } from './state-hooks/song.shortcuts';
export { default as useVerseShortcuts } from './state-hooks/verse.shortcuts';
export { default as useProjectionShortcuts } from './state-hooks/projection.shortcuts';
export { useCommandPaletteShortcuts } from './state-hooks/command.shortcuts';
export { useAutoModeShortcuts } from './state-hooks/automode.shortcuts';
export { default as usePresentationShortcuts } from './state-hooks/presentation.shortcuts';

// Hooks
export { useActiveOrganization } from './hooks/useActiveOrganization';
export { useActiveTextStyle, useTextStyles } from './hooks/useTextStyle';
export { default as useInputFocus } from './hooks/useInputFocus';
export {
  useGetMediaItems,
  useUploadMediaItem,
  useRenameMediaItem,
  useDeleteMediaItem,
  useMediaBlobUrl,
  useMediaPreviewBackfill,
} from './hooks/useMedia';
export { useGetPresentations, useUploadPresentation, useRenamePresentation, useDeletePresentation, useDeletePresentationSlide, usePresentationSlideBlobUrl } from './hooks/usePresentation';
export { usePassphraseConfirmed } from './hooks/usePassphraseConfirmed';
export { default as usePreventScroll } from './hooks/usePreventScroll';
export { useSongValidation } from './hooks/useSongValidation';
export { useGetSongs, useSaveSong, useRenameSong, useUpdateSong, useDeleteSong, useGetSongContent, useAddToServiceList, useRemoveFromServiceList, useClearServiceList, useReorderServiceList, useGetServiceList, useDeleteAllSongs } from './hooks/useSongs';

// Utils
export { shouldIgnoreNavigationShortcut } from './utils/shortcut.guards';
export { default as useShortcut } from './utils/useShortcut';
export { default as useShortcuts } from './utils/useShortcuts';
export { getSongSlidesBySize } from './utils/song.utils';
export { formatBibleReference, formatBibleChapterReference, formatBibleBookName, normalizeBibleBookName } from './utils/verse.utils';
export { normalizeForSearch, makeVerseKey } from './utils/command.search.utils';
export { inDev } from './utils/helpers';

// Parsers
export { parseSong, reconstructRawText, validateSongContent } from './parsers/songParser';
export { isOpenSongFormat, convertOpenSong, OPENSONG_METADATA_FIELDS, DEFAULT_OPENSONG_FIELD_MAPPING, applyOpenSongMapping } from './parsers/openSongParser';
export type { OpenSongMetadata, OpenSongMetadataField, OpenSongTargetField, OpenSongFieldMapping } from './parsers/openSongParser';
export { songToJson, songFromJson, isSongJsonFormat } from './parsers/songJsonFormat';
export type { SongJsonFormat } from './parsers/songJsonFormat';
export { getCachedBlobUrl, setCachedBlobUrl, revokeCachedBlobUrl, setMediaCacheApi } from './parsers/media-cache';

// Jazz CRUD
export type { SongResponse, ServiceListSongResponse } from './jazz/store';
export type { MediaItemResponse } from './jazz/media-store';
export { validateMediaFile } from './jazz/media-store';
export type { TextStyleData } from './jazz/text-style-store';
export { DEFAULT_TEXT_STYLE_TEMPLATE, FALLBACK_TEXT_STYLE, AVAILABLE_FONTS, createTextStyle } from './jazz/text-style-store';
export type { PresentationResponse, PresentationSlideResponse, UploadSlideInput } from './jazz/presentation-store';

// Components
export { default as CommandPalette } from './components/command-palette/CommandPalette';
export { Onboarding } from './components/onboarding/Onboarding';
export { AuthModal } from './components/auth/AuthModal';
export { JazzApiKeyModal } from './components/jazz/JazzApiKeyModal';
export { default as AppTabs } from './components/tabs/Tabs';
export { AcceptInviteHandler } from './components/organizations/AcceptInviteHandler';
export { SettingsAccount } from './components/settings/SettingsAccount';
export { SettingsOrganizations } from './components/settings/SettingsOrganizations';
export { SettingsImportSongs } from './components/settings/SettingsImportSongs';
export { SettingsAppearance } from './components/settings/SettingsAppearance';
export { SettingsSongs } from './components/settings/SettingsSongs';
export { SettingsAutoMode } from './components/settings/SettingsAutoMode';
export { AutoModeStatus } from './components/automode/AutoModeStatus';
export { SlideDebugOverlay } from './components/automode/SlideDebugOverlay';
export { SettingsTextStyles } from './components/settings/SettingsTextStyles';
export { default as AudienceScreen } from './components/screens/audience-screen/AudienceScreen';
export { default as StageScreen } from './components/screens/stage-screen/StageScreen';
export { default as Sidebar } from './components/layout/Sidebar';
