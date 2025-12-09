import { getDocumentHandle } from './repo';
import { GoogleDriveStorageAdapter } from './gdrive-storage';
import { loadStoredTokens } from './auth';
import type { AutomergeDocument } from './types';

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
  private gdriveAdapter: GoogleDriveStorageAdapter | null = null;
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
    this.notifyListeners();
  }

  private getAdapter(): GoogleDriveStorageAdapter {
    if (!this.gdriveAdapter) {
      this.gdriveAdapter = new GoogleDriveStorageAdapter();
    }
    return this.gdriveAdapter;
  }

  /**
   * Export the current Automerge document to a binary format
   */
  private async exportDocument(): Promise<Uint8Array> {
    const handle = await getDocumentHandle();
    const repo = await import('./repo').then(m => m.getRepo());
    
    if (!repo) {
      throw new Error('Repo not available');
    }
    
    if (!handle.doc()) {
      throw new Error('Document not available');
    }

    // Use repo.export() to get binary representation
    // This is the recommended way when using Automerge Repo
    const binary = await repo.export(handle.documentId);
    if (!binary) {
      throw new Error('Failed to export document');
    }
    return binary;
  }

  /**
   * Import a binary Automerge document and merge it with the current one
   */
  private async importDocument(binary: Uint8Array): Promise<void> {
    const handle = await getDocumentHandle();
    const repo = await import('./repo').then(m => m.getRepo());
    
    if (!repo) {
      throw new Error('Repo not available');
    }
    
    if (!handle.doc()) {
      throw new Error('Current document not available');
    }

    // Import the binary document into the repo to get a handle
    // This creates a temporary document handle that we can merge
    const importedHandle = repo.import<AutomergeDocument>(binary);
    
    // Wait for the imported document to be ready
    await importedHandle.whenReady();
    
    // Merge the imported document into the current one using Automerge Repo's merge method
    // This properly merges the CRDT changes
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
      const adapter = this.getAdapter();
      
      // Use a single key for the entire document
      const documentKey: string[] = ['worship-view-main'];
      await adapter.save(documentKey, binary);

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
   */
  async downloadFromDrive(): Promise<void> {
    if (!this.state.isAuthenticated) {
      throw new Error('Not authenticated with Google Drive');
    }

    try {
      this.state.status = 'syncing';
      this.state.error = null;
      this.notifyListeners();

      const adapter = this.getAdapter();
      const documentKey: string[] = ['worship-view-main'];
      const binary = await adapter.load(documentKey);

      if (!binary) {
        // No file in Drive yet, nothing to download
        this.state.status = 'idle';
        this.notifyListeners();
        return;
      }

      await this.importDocument(binary);

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
  startAutoSync(intervalMs = 60000): void {
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

