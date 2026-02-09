import { createRoot } from 'react-dom/client';
import React, { useEffect } from 'react';
import Application from './Application';
import Modal from 'react-modal';
import { injectFontCSS } from './lib/fonts';
import { JazzReactProvider } from 'jazz-tools/react';
import { WorshipViewAccount } from './lib/jazz/schema';
import { isTestMode, TestAppWrapper } from './lib/jazz/test-provider';
import { useAtom } from 'jotai';
import { jazzApiKeyAtom } from '../ipc/jazz/jazz.atoms';
import { JazzApiKeyModal } from './components/jazz/JazzApiKeyModal';
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

// Root component that handles API key loading
function AppWithJazzProvider() {
  const [apiKey, setApiKey] = useAtom(jazzApiKeyAtom);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [apiKeyModalResolved, setApiKeyModalResolved] = React.useState(false);

  useEffect(() => {
    // Show modal if no API key is set and modal hasn't been resolved yet
    if (!apiKey && !apiKeyModalResolved) {
      setShowApiKeyModal(true);
    } else if (apiKey) {
      // If API key exists, mark as resolved
      setApiKeyModalResolved(true);
    }
  }, [apiKey, apiKeyModalResolved]);

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    setShowApiKeyModal(false);
    setApiKeyModalResolved(true);
    // Reload to reinitialize Jazz with new API key
    window.location.reload();
  };

  // Application to Render with Jazz Provider
  // Only enable sync if API key is provided
  // Don't render Application until API key modal is resolved
  // This ensures the Jazz API key modal appears before the auth modal
  if (!apiKeyModalResolved) {
    return (
      <JazzReactProvider
        sync={{
          when: 'never',
        }}
        AccountSchema={WorshipViewAccount}
      >
        <JazzApiKeyModal
          open={showApiKeyModal}
          onOpenChange={() => {
            // Prevent closing without resolving - user must save API key
          }}
          onApiKeySet={handleApiKeySet}
        />
      </JazzReactProvider>
    );
  }

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

  return app;
}

// Render application in DOM using React 18+ API
const root = createRoot(container);

// Use test application in test mode, otherwise use normal provider
if (isTestMode()) {
  console.log('[ERWT] : Running in test mode');
  root.render(
    <TestAppWrapper>
      <Application />
    </TestAppWrapper>
  );
} else {
  root.render(<AppWithJazzProvider />);
}

// Hot module replacement with Vite
if (import.meta.hot) {
  import.meta.hot.accept();
  // Re-inject fonts on HMR
  import.meta.hot.accept('./lib/fonts', () => {
    injectFontCSS();
  });
}

