// Electron's built-in autoUpdater types
export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string | string[];
}

export type UpdatePreloadType = {
  checkForUpdates: () => Promise<void>;
  downloadUpdate: () => Promise<void>;
  quitAndInstall: () => Promise<void>;
  onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateNotAvailable: (callback: () => void) => () => void;
  onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;
  onUpdateError: (callback: (error: Error) => void) => () => void;
  onCheckingForUpdate: (callback: () => void) => () => void;
};

export const UpdateChannels = {
  checkForUpdates: 'update.check-for-updates',
  downloadUpdate: 'update.download-update',
  quitAndInstall: 'update.quit-and-install',
  onUpdateAvailable: 'update.on-update-available',
  onUpdateNotAvailable: 'update.on-update-not-available',
  onUpdateDownloaded: 'update.on-update-downloaded',
  onUpdateError: 'update.on-update-error',
  onCheckingForUpdate: 'update.on-checking-for-update',
} as const;

