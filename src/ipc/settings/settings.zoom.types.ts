export type SettingsZoomPreloadType = {
  setZoomFactor: (zoomFactor: number) => Promise<void>;
};

export const SettingsZoomChannels = {
  setZoomFactor: 'settings.set-zoom-factor',
};
