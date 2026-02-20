export type UpdateCheckResult = {
  status: 'disabled' | 'checking' | 'available' | 'not-available' | 'error';
  message: string;
  version?: string;
};

export type DownloadedUpdateStateResult = {
  status: 'disabled' | 'idle' | 'downloaded' | 'installing';
  message: string;
  version?: string;
  releaseName?: string;
  releaseDate?: string;
  releaseNotes?: string;
};

export type InstallDownloadedUpdateResult = {
  status: 'disabled' | 'not-downloaded' | 'installing' | 'error';
  message: string;
};

export type UpdatePreloadType = {
  checkForUpdates: () => Promise<UpdateCheckResult>;
  getDownloadedUpdateState: () => Promise<DownloadedUpdateStateResult>;
  installDownloadedUpdate: () => Promise<InstallDownloadedUpdateResult>;
};

export const UpdateChannels = {
  checkForUpdates: 'update.check-for-updates',
  getDownloadedUpdateState: 'update.get-downloaded-update-state',
  installDownloadedUpdate: 'update.install-downloaded-update',
};
