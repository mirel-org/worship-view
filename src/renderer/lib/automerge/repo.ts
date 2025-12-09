import { Repo, DocHandle, AnyDocumentId } from '@automerge/automerge-repo';
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb';
import { createEmptyDocument, AutomergeDocument } from './schema';

let repo: Repo | null = null;
let documentHandle: DocHandle<AutomergeDocument> | null = null;
const DOCUMENT_ID_KEY = 'worship-view-document-id';

export async function initializeRepo(): Promise<Repo> {
  if (repo) {
    return repo;
  }

  // Use IndexedDB for local storage (primary)
  const localStorage = new IndexedDBStorageAdapter();
  
  // Google Drive storage for sync (will be used for backup/sync)
  // Note: For now, we'll use IndexedDB as primary storage
  // Google Drive sync can be added later as a separate sync mechanism
  
  // Create repo with IndexedDB storage
  repo = new Repo({
    storage: localStorage,
  });

  return repo;
}

export async function getDocumentHandle(): Promise<DocHandle<AutomergeDocument>> {
  if (documentHandle) {
    return documentHandle;
  }

  const repoInstance = await initializeRepo();
  
  // Try to load existing document ID from localStorage
  let documentId: string | null = null;
  if (typeof window !== 'undefined') {
    documentId = localStorage.getItem(DOCUMENT_ID_KEY);
  }
  
  // If we have a stored document ID, try to find the document
  if (documentId) {
    try {
      const handle = await repoInstance.find<AutomergeDocument>(documentId as AnyDocumentId);
      if (handle) {
        await handle.whenReady();
        documentHandle = handle;
        return documentHandle;
      }
    } catch (error) {
      // Document not found, we'll create a new one
      console.log('Stored document ID not found, creating new document');
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DOCUMENT_ID_KEY);
      }
    }
  }
  
  // Check if we should try loading from Google Drive first (if IndexedDB is empty)
  const shouldTryGDrive = !documentId;
  
  if (shouldTryGDrive) {
    try {
      const { gdriveSyncService } = await import('./gdrive-sync');
      const gdriveState = gdriveSyncService.getState();
      
      if (gdriveState.isAuthenticated) {
        // Try to download from Google Drive
        try {
          await gdriveSyncService.downloadFromDrive();
          // If download succeeded, try to find the document again
          if (typeof window !== 'undefined') {
            documentId = localStorage.getItem(DOCUMENT_ID_KEY);
            if (documentId) {
              const handle = await repoInstance.find<AutomergeDocument>(documentId as AnyDocumentId);
              if (handle) {
                await handle.whenReady();
                documentHandle = handle;
                return documentHandle;
              }
            }
          }
        } catch (error) {
          // Download failed, continue with creating new document
          console.log('Failed to load from Google Drive, creating new document:', error);
        }
      }
    } catch (error) {
      // Google Drive sync not available, continue with creating new document
      console.log('Google Drive sync not available:', error);
    }
  }
  
  // Create new document with initial empty structure
  const handle = repoInstance.create<AutomergeDocument>(createEmptyDocument());

  // Wait for document to be ready
  await handle.whenReady();
  
  // Store the document ID so we can find it later
  if (typeof window !== 'undefined') {
    localStorage.setItem(DOCUMENT_ID_KEY, handle.documentId);
  }
  
  documentHandle = handle;
  return documentHandle;
}

export function getRepo(): Repo | null {
  return repo;
}

export function getDocument(): DocHandle<AutomergeDocument> | null {
  return documentHandle;
}

