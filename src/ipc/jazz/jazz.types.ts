export type JazzPreloadType = {
  getApiKey: () => Promise<string | undefined>;
};

export const JazzChannels = {
  getApiKey: 'jazz.get-api-key',
};

