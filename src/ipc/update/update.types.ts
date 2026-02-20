export type UpdateCheckResult = {
  status: 'disabled' | 'checking' | 'available' | 'not-available' | 'error';
  message: string;
  version?: string;
};

export type UpdatePreloadType = {
  checkForUpdates: () => Promise<UpdateCheckResult>;
};

export const UpdateChannels = {
  checkForUpdates: 'update.check-for-updates',
};
