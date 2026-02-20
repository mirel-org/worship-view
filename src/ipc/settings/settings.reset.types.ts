export type SettingsResetLocalStateResult = {
  status: 'restarting' | 'error';
  message: string;
};

export type SettingsResetPreloadType = {
  resetLocalStateAndRestart: () => Promise<SettingsResetLocalStateResult>;
};

export const SettingsResetChannels = {
  resetLocalStateAndRestart: 'settings.reset-local-state-and-restart',
};
