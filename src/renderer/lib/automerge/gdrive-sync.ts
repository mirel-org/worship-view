import * as Automerge from '@automerge/automerge';
import { getDocumentHandle } from './repo';
import { loadStoredTokens } from './auth';
import { getApiClient } from '@ipc/index';
import type { AutomergeDocument } from './types';

const DOCUMENT_FILE_NAME = 'worship-view-data.automerge';
const api = getApiClient();

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: Date | null;
  error: string | null;
  isAuthenticated: boolean;
}

class GoogleDriveSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private syncInProgress = false;
  private fileId: string | null = null;
  private lastKnownModifiedTime: string | null = null;
  private listeners: Set<(state: SyncState) => void> = new Set();
  private state: SyncState = {
    status: 'idle',
    lastSyncTime: null,
    error: null,
    isAuthenticated: false,
  };

  constructor() {
    this.checkAuthentication();
  }

  private async checkAuthentication() {
    const tokens = await loadStoredTokens();
    this.state.isAuthenticated = !!tokens;
    this.notifyListeners();
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state); // Immediately notify with current state
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  async authenticate(): Promise<{ authUrl: string }> {
    const { getAuthUrl } = await import('./auth');
    const authUrl = await getAuthUrl();
    return { authUrl };
  }

  async completeAuthentication(code: string): Promise<void> {
    const { getTokensFromCode, storeTokens } = await import('./auth');
    const tokens = await getTokensFromCode(code);
    await storeTokens(tokens.accessToken, tokens.refreshToken);
    this.state.isAuthenticated = true;
    this.state.error = null;
    this.notifyListeners();
  }

  async disconnect(): Promise<void> {
    const { clearStoredTokens } = await import('./auth');
    await clearStoredTokens();
    this.state.isAuthenticated = false;
    this.state.error = null;
    this.fileId = null;
    this.lastKnownModifiedTime = null;
    this.notifyListeners();
  }

  private async getFileId(): Promise<string> {
    if (this.fileId) {
      return this.fileId;
    }
    this.fileId = await api.findOrCreateFile(DOCUMENT_FILE_NAME);
    return this.fileId;
  }

  /**
   * Export the current Automerge document to a binary format using Automerge.save()
   */
  private async exportDocument(): Promise<Uint8Array> {
    const handle = await getDocumentHandle();
    const doc = handle.doc();
    
    if (!doc) {
      throw new Error('Document not available');
    }

    // Use Automerge.save() directly to get binary representation
    return Automerge.save(doc);
  }

  /**
   * Import a binary Automerge document and merge it with the current one
   * Uses repo.import() and handle.merge() to properly handle document state
   */
  private async importDocument(binary: Uint8Array): Promise<void> {
    const repo = await import('./repo').then(m => m.getRepo());
    if (!repo) {
      throw new Error('Repo not available');
    }

    const handle = await getDocumentHandle();
    
    if (!handle.doc()) {
      throw new Error('Current document not available');
    }

    // Import the binary document into the repo to get a handle
    // This creates a temporary document handle that we can merge
    const importedHandle = repo.import<AutomergeDocument>(binary);
    
    // Wait for the imported document to be ready
    await importedHandle.whenReady();
    
    // Merge the imported document into the current one using Automerge Repo's merge method
    // This properly merges the CRDT changes and updates the handle's document state
    handle.merge(importedHandle);
    
    // Clean up: delete the temporary imported document from the repo
    // The merge operation has already copied all changes into the main handle
    repo.delete(importedHandle.documentId);
  }

  /**
   * Upload document to Google Drive
   */
  async uploadToDrive(): Promise<void> {
    if (!this.state.isAuthenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      this.state.status = 'syncing';
      this.state.error = null;
      this.notifyListeners();

      const binary = await this.exportDocument();
      const fileId = await this.getFileId();
      await api.saveFile(fileId, binary);

      // Update modifiedTime after successful upload
      const metadata = await api.getFileMetadata(fileId);
      if (metadata) {
        this.lastKnownModifiedTime = metadata.modifiedTime;
      }

      this.state.status = 'success';
      this.state.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (error: any) {
      this.state.status = 'error';
      this.state.error = error.message || 'Failed to upload to Google Drive';
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Download document from Google Drive
   * Checks metadata first to avoid unnecessary downloads
   */
  async downloadFromDrive(): Promise<void> {
    if (!this.state.isAuthenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      const fileId = await this.getFileId();
      
      // Check file metadata first to see if it has changed
      const metadata = await api.getFileMetadata(fileId);
      
      if (!metadata) {
        // No file in Drive yet, nothing to download
        this.state.status = 'idle';
        this.notifyListeners();
        return;
      }

      // If modifiedTime hasn't changed, skip download
      if (this.lastKnownModifiedTime && metadata.modifiedTime === this.lastKnownModifiedTime) {
        // File hasn't changed, no need to download
        return;
      }

      this.state.status = 'syncing';
      this.state.error = null;
      this.notifyListeners();

      // Download the file
      const binary = await api.loadFile(fileId);

      if (!binary) {
        // File doesn't exist or is empty
        this.state.status = 'idle';
        this.notifyListeners();
        return;
      }

      await this.importDocument(binary);

      // Update lastKnownModifiedTime after successful download
      this.lastKnownModifiedTime = metadata.modifiedTime;

      this.state.status = 'success';
      this.state.lastSyncTime = new Date();
      this.notifyListeners();
    } catch (error: any) {
      this.state.status = 'error';
      this.state.error = error.message || 'Failed to download from Google Drive';
      this.notifyListeners();
      throw error;
    }
  }

  /**
   * Sync: bidirectional sync with Google Drive
   * 1. Download from Drive first (merge remote changes)
   * 2. Upload to Drive (push local changes)
   */
  async sync(): Promise<void> {
    if (this.syncInProgress) {
      return;
    }

    if (!this.state.isAuthenticated) {
      return;
    }

    this.syncInProgress = true;
    try {
      // Step 1: Download and merge remote changes first
      // This ensures we have the latest remote changes before uploading
      try {
        await this.downloadFromDrive();
      } catch (downloadError: any) {
        // If download fails but file doesn't exist, that's okay - continue to upload
        // If it's a different error, log it but continue to upload to preserve local changes
        if (!downloadError.message?.includes('not found') && !downloadError.message?.includes('404')) {
          console.warn('Download failed during sync, continuing with upload:', downloadError);
        }
      }

      // Step 2: Upload local changes (including any merged changes from step 1)
      await this.uploadToDrive();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Start automatic syncing at intervals
   */
  startAutoSync(intervalMs = 30000): void {
    if (this.syncInterval) {
      return;
    }

    // Initial sync
    this.sync();

    // Then sync at intervals
    this.syncInterval = setInterval(() => {
      this.sync();
    }, intervalMs);
  }

  /**
   * Stop automatic syncing
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  getState(): SyncState {
    return { ...this.state };
  }
}

// Singleton instance
export const gdriveSyncService = new GoogleDriveSyncService();

