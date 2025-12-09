import { createRoot } from 'react-dom/client';
import Application from './Application';
import Modal from 'react-modal';
import { injectFontCSS } from './lib/fonts';
import { initializeRepo, getDocumentHandle } from './lib/automerge/repo';
import './index.css';

// Say something
console.log('[ERWT] : Renderer execution started');

// Initialize Automerge repo and document on app start
async function initializeAutomerge() {
  try {
    await initializeRepo();
    // Pre-initialize the document handle so it's ready when needed
    await getDocumentHandle();
    console.log('[ERWT] Automerge initialized successfully');
    
    // Start Google Drive auto-sync if authenticated
    try {
      const { gdriveSyncService } = await import('./lib/automerge/gdrive-sync');
      const state = gdriveSyncService.getState();
      if (state.isAuthenticated) {
        // Start auto-sync every 60 seconds
        gdriveSyncService.startAutoSync(60000);
        console.log('[ERWT] Google Drive auto-sync started');
      }
    } catch (error) {
      // Google Drive sync not available, continue without it
      console.log('[ERWT] Google Drive sync not available:', error);
    }
  } catch (error) {
    console.error('Failed to initialize Automerge:', error);
  }
}

initializeAutomerge();

// Inject fonts before rendering
injectFontCSS();

Modal.setAppElement(document.getElementById('app') as HTMLElement);

// Application to Render
const app = <Application />;

// Get root element
const container = document.getElementById('app');
if (!container) {
  throw new Error('Root element not found');
}

// Render application in DOM using React 18+ API
const root = createRoot(container);
root.render(app);

// Hot module replacement with Vite
if (import.meta.hot) {
  import.meta.hot.accept();
  // Re-inject fonts on HMR
  import.meta.hot.accept('./lib/fonts', () => {
    injectFontCSS();
  });
}

