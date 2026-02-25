import { createRoot } from 'react-dom/client';
import React, { useEffect } from 'react';
import Application from './Application';
import { JazzReactProvider } from 'jazz-tools/react';
import { WorshipViewAccount } from '@worship-view/schema';
import { useAtom } from 'jotai';
import { jazzApiKeyAtom, JazzApiKeyModal } from '@worship-view/core';
import './index.css';

console.log('[Worship View Webapp] : Renderer execution started');

const container = document.getElementById('app');
if (!container) {
  throw new Error('Root element not found');
}

function AppWithJazzProvider() {
  const [apiKey, setApiKey] = useAtom(jazzApiKeyAtom);
  const [showApiKeyModal, setShowApiKeyModal] = React.useState(false);
  const [apiKeyModalResolved, setApiKeyModalResolved] = React.useState(false);

  useEffect(() => {
    if (!apiKey && !apiKeyModalResolved) {
      setShowApiKeyModal(true);
    } else if (apiKey) {
      setApiKeyModalResolved(true);
    }
  }, [apiKey, apiKeyModalResolved]);

  const handleApiKeySet = (newApiKey: string) => {
    setApiKey(newApiKey);
    setShowApiKeyModal(false);
    setApiKeyModalResolved(true);
    window.location.reload();
  };

  if (!apiKeyModalResolved) {
    return (
      <JazzReactProvider
        sync={{ when: 'never' }}
        AccountSchema={WorshipViewAccount}
      >
        <JazzApiKeyModal
          open={showApiKeyModal}
          onOpenChange={() => {}}
          onApiKeySet={handleApiKeySet}
        />
      </JazzReactProvider>
    );
  }

  return apiKey ? (
    <JazzReactProvider
      sync={{ peer: `wss://cloud.jazz.tools/?key=${apiKey}` }}
      AccountSchema={WorshipViewAccount}
    >
      <Application />
    </JazzReactProvider>
  ) : (
    <JazzReactProvider
      sync={{ when: 'never' }}
      AccountSchema={WorshipViewAccount}
    >
      <Application />
    </JazzReactProvider>
  );
}

const root = createRoot(container);
root.render(<AppWithJazzProvider />);

if (import.meta.hot) {
  import.meta.hot.accept();
}
