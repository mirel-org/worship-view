import { ipcRenderer } from 'electron';
import { GoogleDriveChannels, GoogleDrivePreloadType } from './gdrive.types';

const gdrivePreload: GoogleDrivePreloadType = {
  getAuthUrl: () => ipcRenderer.invoke(GoogleDriveChannels.getAuthUrl),
  getTokensFromCode: (code: string) => ipcRenderer.invoke(GoogleDriveChannels.getTokensFromCode, code),
  refreshAccessToken: (refreshToken: string) => ipcRenderer.invoke(GoogleDriveChannels.refreshAccessToken, refreshToken),
  storeTokens: (accessToken: string, refreshToken: string) => ipcRenderer.invoke(GoogleDriveChannels.storeTokens, accessToken, refreshToken),
  loadStoredTokens: () => ipcRenderer.invoke(GoogleDriveChannels.loadStoredTokens),
  clearStoredTokens: () => ipcRenderer.invoke(GoogleDriveChannels.clearStoredTokens),
  findOrCreateFile: (fileName: string) => ipcRenderer.invoke(GoogleDriveChannels.findOrCreateFile, fileName),
  loadFile: (fileId: string) => ipcRenderer.invoke(GoogleDriveChannels.loadFile, fileId),
  saveFile: (fileId: string, data: Uint8Array) => ipcRenderer.invoke(GoogleDriveChannels.saveFile, fileId, data),
  deleteFile: (fileId: string) => ipcRenderer.invoke(GoogleDriveChannels.deleteFile, fileId),
  getFileMetadata: (fileId: string) => ipcRenderer.invoke(GoogleDriveChannels.getFileMetadata, fileId),
};

export default gdrivePreload;

