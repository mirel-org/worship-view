import { StorageAdapterInterface, StorageKey } from '@automerge/automerge-repo';
import type { Chunk } from '@automerge/automerge-repo/dist/storage/types';
import { google } from 'googleapis';
import { getAuthClient, refreshAccessToken, loadStoredTokens } from './auth';

const DOCUMENT_FILE_NAME = 'worship-view-data.automerge';

export class GoogleDriveStorageAdapter implements StorageAdapterInterface {
  private drive: ReturnType<typeof google.drive>;
  private fileId: string | null = null;

  constructor() {
    this.drive = google.drive({ version: 'v3', auth: getAuthClient() });
  }

  async ensureAuthenticated(): Promise<void> {
    const tokens = await loadStoredTokens();
    if (!tokens) {
      throw new Error('Not authenticated with Google Drive. Please authenticate first.');
    }

    try {
      // Try to use existing token, refresh if needed
      const authClient = getAuthClient();
      authClient.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
    } catch (error) {
      // Token might be expired, try to refresh
      if (tokens.refreshToken) {
        const newAccessToken = await refreshAccessToken(tokens.refreshToken);
        const authClient = getAuthClient();
        authClient.setCredentials({
          access_token: newAccessToken,
          refresh_token: tokens.refreshToken,
        });
      } else {
        throw new Error('Authentication failed. Please re-authenticate.');
      }
    }
  }

  async findOrCreateFile(): Promise<string> {
    if (this.fileId) {
      return this.fileId;
    }

    await this.ensureAuthenticated();

    // Search for existing file
    const response = await this.drive.files.list({
      q: `name='${DOCUMENT_FILE_NAME}' and trashed=false`,
      fields: 'files(id, name)',
      spaces: 'appDataFolder', // Use app data folder for privacy
    });

    if (response.data.files && response.data.files.length > 0) {
      this.fileId = response.data.files[0].id!;
      return this.fileId;
    }

    // Create new file
    const createResponse = await this.drive.files.create({
      requestBody: {
        name: DOCUMENT_FILE_NAME,
        parents: ['appDataFolder'], // Store in app data folder
      },
      fields: 'id',
    });

    if (!createResponse.data.id) {
      throw new Error('Failed to create Google Drive file');
    }

    this.fileId = createResponse.data.id;
    return this.fileId;
  }

  async load(key: StorageKey): Promise<Uint8Array | undefined> {
    try {
      await this.ensureAuthenticated();
      const fileId = await this.findOrCreateFile();

      const response = await this.drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        { responseType: 'arraybuffer' }
      );

      if (response.data) {
        return new Uint8Array(response.data as ArrayBuffer);
      }

      return undefined;
    } catch (error: any) {
      if (error.code === 404) {
        return undefined; // File doesn't exist yet
      }
      console.error('Error loading from Google Drive:', error);
      throw error;
    }
  }

  async save(key: StorageKey, data: Uint8Array): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const fileId = await this.findOrCreateFile();

      await this.drive.files.update({
        fileId,
        media: {
          mimeType: 'application/octet-stream',
          body: Buffer.from(data),
        },
      });
    } catch (error) {
      console.error('Error saving to Google Drive:', error);
      throw error;
    }
  }

  async remove(key: StorageKey): Promise<void> {
    try {
      await this.ensureAuthenticated();
      const fileId = await this.findOrCreateFile();

      await this.drive.files.delete({
        fileId,
      });

      this.fileId = null; // Reset file ID since file is deleted
    } catch (error: any) {
      if (error.code !== 404) {
        console.error('Error removing from Google Drive:', error);
        throw error;
      }
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

