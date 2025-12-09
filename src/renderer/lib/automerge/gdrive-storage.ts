import { StorageAdapterInterface, StorageKey } from '@automerge/automerge-repo';
import type { Chunk } from '@automerge/automerge-repo/dist/storage/types';
import { refreshAccessToken, loadStoredTokens, storeTokens } from './auth';
import { getApiClient } from '@ipc/index';

const DOCUMENT_FILE_NAME = 'worship-view-data.automerge';

const api = getApiClient();

export class GoogleDriveStorageAdapter implements StorageAdapterInterface {
  private fileId: string | null = null;
  private accessToken: string | null = null;

  private async getAccessToken(): Promise<string> {
    // Return cached token if available
    if (this.accessToken) {
      return this.accessToken;
    }

    const tokens = await loadStoredTokens();
    if (!tokens) {
      throw new Error('Not authenticated with Google Drive. Please authenticate first.');
    }

    // Try to use existing token, refresh if needed
    try {
      // Test if token is still valid by making a simple API call
      // We'll use findOrCreateFile which will handle token refresh internally
      this.accessToken = tokens.accessToken;
      return this.accessToken;
    } catch (error) {
      // Token might be expired, try to refresh
      if (tokens.refreshToken) {
        const newAccessToken = await refreshAccessToken(tokens.refreshToken);
        this.accessToken = newAccessToken;
        // Update stored token
        await storeTokens(newAccessToken, tokens.refreshToken);
        return newAccessToken;
      } else {
        throw new Error('Authentication failed. Please re-authenticate.');
      }
    }
  }

  async ensureAuthenticated(): Promise<void> {
    await this.getAccessToken();
  }

  async findOrCreateFile(_key?: StorageKey): Promise<string> {
    // For now, we use a single file for all data
    // In the future, we could use the key to determine which file to use
    if (this.fileId) {
      return this.fileId;
    }

    // Use IPC to find or create file in main process
    // The main process handles token refresh automatically
    try {
      this.fileId = await api.findOrCreateFile(DOCUMENT_FILE_NAME);
      return this.fileId;
    } catch (error: any) {
      // If error is due to expired token, try refreshing
      if (error.message?.includes('401') || error.message?.includes('authentication')) {
        const tokens = await loadStoredTokens();
        if (tokens?.refreshToken) {
          const newAccessToken = await refreshAccessToken(tokens.refreshToken);
          await storeTokens(newAccessToken, tokens.refreshToken);
          this.accessToken = newAccessToken;
          // Retry
          this.fileId = await api.findOrCreateFile(DOCUMENT_FILE_NAME);
          return this.fileId;
        }
      }
      throw error;
    }
  }

  async load(key: StorageKey): Promise<Uint8Array | undefined> {
    try {
      const fileId = await this.findOrCreateFile();
      const data = await api.loadFile(fileId);
      return data || undefined;
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        return undefined; // File doesn't exist yet
      }
      console.error('Error loading from Google Drive:', error);
      throw error;
    }
  }

  async save(_key: StorageKey, data: Uint8Array): Promise<void> {
    try {
      const fileId = await this.findOrCreateFile();
      await api.saveFile(fileId, data);
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }

  async remove(_key: StorageKey): Promise<void> {
    try {
      if (!this.fileId) {
        // Try to find the file first
        try {
          this.fileId = await api.findOrCreateFile(DOCUMENT_FILE_NAME);
        } catch (error: any) {
          if (error.message?.includes('404') || error.message?.includes('not found')) {
            // File doesn't exist, that's fine
            return;
          }
          throw error;
        }
      }

      if (this.fileId) {
        await api.deleteFile(this.fileId);
        this.fileId = null; // Reset file ID since file is deleted
      }
    } catch (error: any) {
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        // File doesn't exist, that's fine
        return;
      }
      console.error('Error removing from Google Drive:', error);
      throw error;
    }
  }

  async loadRange(keyPrefix: StorageKey): Promise<Chunk[]> {
    // Load all chunks with the given key prefix
    // For Google Drive, we'll load the main document
    const data = await this.load(keyPrefix);
    if (!data) return [];

    // Return as a single chunk
    return [{ data, key: keyPrefix }];
  }

  async removeRange(keyPrefix: StorageKey): Promise<void> {
    // Remove all chunks with the given key prefix
    // For Google Drive, this means removing the file
    await this.remove(keyPrefix);
  }
}
