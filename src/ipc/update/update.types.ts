export type UpdatePreloadType = {
  checkForUpdates: () => Promise<void>;
};

export const UpdateChannels = {
  checkForUpdates: 'update.check-for-updates',
};
