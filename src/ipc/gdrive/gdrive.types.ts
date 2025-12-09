export type GoogleDrivePreloadType = {
  getAuthUrl: () => Promise<{ authUrl: string }>;
  getTokensFromCode: (code: string) => Promise<{ accessToken: string; refreshToken: string }>;
  refreshAccessToken: (refreshToken: string) => Promise<string>;
  storeTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  loadStoredTokens: () => Promise<{ accessToken: string; refreshToken: string } | null>;
  clearStoredTokens: () => Promise<void>;
  findOrCreateFile: (fileName: string) => Promise<string>;
  loadFile: (fileId: string) => Promise<Uint8Array | null>;
  saveFile: (fileId: string, data: Uint8Array) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
};

export const GoogleDriveChannels = {
  getAuthUrl: 'gdrive.get-auth-url',
  getTokensFromCode: 'gdrive.get-tokens-from-code',
  refreshAccessToken: 'gdrive.refresh-access-token',
  storeTokens: 'gdrive.store-tokens',
  loadStoredTokens: 'gdrive.load-stored-tokens',
  clearStoredTokens: 'gdrive.clear-stored-tokens',
  findOrCreateFile: 'gdrive.find-or-create-file',
  loadFile: 'gdrive.load-file',
  saveFile: 'gdrive.save-file',
  deleteFile: 'gdrive.delete-file',
} as const;

