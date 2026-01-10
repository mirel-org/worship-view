import { useAtom } from 'jotai';
import React, { memo, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIsAuthenticated } from 'jazz-tools/react';
import { Button } from './components/ui/button';
import Screens from './components/screens/Screens';
import { areScreensEnabledAtom } from '../ipc/screen/screen.atoms';
import Settings from './components/settings/Settings';
import { areSettingsOpenAtom } from '../ipc/settings/settings.atoms';
import AppTabs from './components/tabs/Tabs';
import CommandPalette from './components/command-palette/CommandPalette';
import { AuthModal } from './components/auth/AuthModal';
import { AcceptInviteHandler } from './components/organizations/AcceptInviteHandler';
import { useSetup } from '../ipc/';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Generics = memo(function Generics() {
  return (
    <>
      <Screens />
      <Settings />
      <CommandPalette />
      <Setup />
    </>
  );
});

const Application: React.FC = () => {
  const [areScreensEnabled, setAreScreensEnabled] = useAtom(
    areScreensEnabledAtom,
  );
  const [, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const isAuthenticated = useIsAuthenticated();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
    }
  }, [isAuthenticated]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <AcceptInviteHandler />
      <div className="h-full p-4 box-border bg-background text-foreground font-sans antialiased selection:bg-primary selection:text-primary-foreground">
        <div className="h-[50px] flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Button
              variant={areScreensEnabled ? 'default' : 'secondary'}
              onClick={() => setAreScreensEnabled(!areScreensEnabled)}
              className="w-24"
            >
              {areScreensEnabled ? 'Enabled' : 'Enable'}
            </Button>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setAreSettingsOpen(true)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-settings"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.09a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.09a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.09a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>
        </div>
        <div className="h-[calc(100%-66px)] border border-border rounded-xl overflow-hidden bg-card shadow-sm">
          <AppTabs />
        </div>
        <Generics />
      </div>
    </QueryClientProvider>
  );
};

export default Application;

const Setup = () => {
  useSetup();
  return <></>;
};
