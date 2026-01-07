import { createRoot } from 'react-dom/client';
import React from 'react';
import Application from './Application';
import Modal from 'react-modal';
import { injectFontCSS } from './lib/fonts';
import { JazzReactProvider } from 'jazz-tools/react';
import { WorshipViewAccount } from './lib/jazz/schema';
import { getApiClient } from '../ipc';
import './index.css';

// Say something
console.log('[ERWT] : Renderer execution started');

// Inject fonts before rendering
injectFontCSS();

Modal.setAppElement(document.getElementById('app') as HTMLElement);

// Get root element
const container = document.getElementById('app');
if (!container) {
  throw new Error('Root element not found');
}

// Get Jazz Cloud API key from main process via IPC
// Set VITE_JAZZ_API_KEY in your .env file
// Get your API key from https://dashboard.jazz.tools
const { getApiKey } = getApiClient();

getApiKey()
  .then((apiKey) => {
    if (!apiKey) {
      console.warn(
        'VITE_JAZZ_API_KEY is not set. Jazz Cloud sync will not work. ' +
        'Set VITE_JAZZ_API_KEY in your .env file or get a key from https://dashboard.jazz.tools'
      );
    }

    // Application to Render with Jazz Provider
    // Only enable sync if API key is provided
    const app = apiKey ? (
      <JazzReactProvider
        sync={{
          peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
        }}
        AccountSchema={WorshipViewAccount}
      >
        <Application />
      </JazzReactProvider>
    ) : (
      <JazzReactProvider
        sync={{
          when: 'never',
        }}
        AccountSchema={WorshipViewAccount}
      >
        <Application />
      </JazzReactProvider>
    );

    // Render application in DOM using React 18+ API
    const root = createRoot(container);
    root.render(app);
  })
  .catch((error) => {
    console.error('Failed to get Jazz API key:', error);
    // Render app without sync if API key retrieval fails
    const app = (
      <JazzReactProvider
        sync={{
          when: 'never',
        }}
        AccountSchema={WorshipViewAccount}
      >
        <Application />
      </JazzReactProvider>
    );
    const root = createRoot(container);
    root.render(app);
  });

// Hot module replacement with Vite
if (import.meta.hot) {
  import.meta.hot.accept();
  // Re-inject fonts on HMR
  import.meta.hot.accept('./lib/fonts', () => {
    injectFontCSS();
  });
}

