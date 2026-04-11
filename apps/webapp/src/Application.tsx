import { useAtom } from 'jotai';
import React, { memo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Menu, Search, Settings, MonitorSmartphone, Unplug } from 'lucide-react';
import {
  areSettingsOpenAtom,
  selectedTabTypeAtom,
  commandPaletteOpenAtom,
  openSidebar,
  CommandPalette,
  AppTabs,
  Onboarding,
  AcceptInviteHandler,
  useActiveOrganization,
  OperatorSessionProviderWrapper,
} from '@worship-view/core';
import SettingsModal from './components/settings/Settings';
import SessionList from './components/remote/SessionList';
import { useWebappSetup } from './setup';

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
      <SettingsModal />
      <CommandPalette />
      <Setup />
    </>
  );
});

const ApplicationInner: React.FC<{
  connectedSessionId: string | null;
  onDisconnect: () => void;
  onShowSessionList: () => void;
}> = ({ connectedSessionId, onDisconnect, onShowSessionList }) => {
  const [, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const [selectedTabType, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setCommandPaletteOpen] = useAtom(commandPaletteOpenAtom);

  return (
    <div
      className="h-full bg-background text-foreground antialiased selection:bg-primary/20 selection:text-foreground"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div className="h-[50px] flex items-center gap-2 md:gap-4 px-2">
        <button
          type="button"
          onClick={() => openSidebar()}
          aria-label="Deschide meniul"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent/70 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden lg:flex flex-1" />

        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          className="h-9 flex-1 md:flex-none md:w-[280px] lg:w-[340px] rounded-md border border-input bg-background px-3 flex items-center gap-2 text-sm text-muted-foreground"
          aria-label="Deschide paleta de comenzi"
        >
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate flex-1 text-left text-sm text-muted-foreground hidden sm:inline">
            Caută cântece, versete sau comenzi...
          </span>
          <span className="h-5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium leading-5 text-muted-foreground hidden md:inline-flex">
            F2
          </span>
        </button>

        <div className="flex items-center justify-end gap-2 md:gap-4 lg:flex-1">
          <div className="h-10 rounded-md bg-muted p-1 inline-flex items-center gap-2 border border-border">
            <button
              type="button"
              role="tab"
              aria-selected={selectedTabType === 'songs'}
              data-state={selectedTabType === 'songs' ? 'active' : 'inactive'}
              onClick={() => setSelectedTabType('songs')}
              className={
                selectedTabType === 'songs'
                  ? 'h-8 px-3 rounded-[2px] bg-background text-foreground text-sm font-medium shadow-[0_1px_1.75px_rgba(0,0,0,0.05)]'
                  : 'h-8 px-3 rounded-[2px] text-muted-foreground text-sm font-medium'
              }
            >
              Melodii
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={selectedTabType === 'bible'}
              data-state={selectedTabType === 'bible' ? 'active' : 'inactive'}
              onClick={() => setSelectedTabType('bible')}
              className={
                selectedTabType === 'bible'
                  ? 'h-8 px-3 rounded-[2px] bg-background text-foreground text-sm font-medium shadow-[0_1px_1.75px_rgba(0,0,0,0.05)]'
                  : 'h-8 px-3 rounded-[2px] text-muted-foreground text-sm font-medium'
              }
            >
              Biblie
            </button>
          </div>

          {connectedSessionId ? (
            <button
              type="button"
              onClick={onDisconnect}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold bg-destructive text-destructive-foreground"
              aria-label="Deconectare"
            >
              <Unplug className="h-4 w-4" />
              <span className="hidden sm:inline">Deconectare</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onShowSessionList}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 border border-border text-sm font-medium text-muted-foreground hover:bg-accent/70"
              aria-label="Conectare la proiector"
            >
              <MonitorSmartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Conectare</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setAreSettingsOpen(true)}
            data-testid="settings-button"
            aria-label="Setări"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-accent/70"
          >
            <Settings className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="h-[calc(100%-50px)] overflow-hidden bg-card">
        <AppTabs />
      </div>
      <Generics />
    </div>
  );
};

const SessionWrapper: React.FC = () => {
  const { activeOrganization } = useActiveOrganization();
  const [connectedSessionId, setConnectedSessionId] = useState<string | null>(null);
  const [showSessionList, setShowSessionList] = useState(false);

  const handleConnect = (sessionId: string) => {
    setConnectedSessionId(sessionId);
    setShowSessionList(false);
  };

  const handleDisconnect = () => {
    setConnectedSessionId(null);
  };

  const inner = (
    <>
      {showSessionList && !connectedSessionId && (
        <SessionList
          onConnect={handleConnect}
          onClose={() => setShowSessionList(false)}
        />
      )}
      <ApplicationInner
        connectedSessionId={connectedSessionId}
        onDisconnect={handleDisconnect}
        onShowSessionList={() => setShowSessionList(true)}
      />
    </>
  );

  if (!connectedSessionId || !activeOrganization) {
    return inner;
  }

  return (
    <OperatorSessionProviderWrapper
      mode="remote"
      organization={activeOrganization as any}
      sessionId={connectedSessionId}
    >
      {inner}
    </OperatorSessionProviderWrapper>
  );
};

const Application: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Onboarding>
        <AcceptInviteHandler />
        <SessionWrapper />
      </Onboarding>
    </QueryClientProvider>
  );
};

export default Application;

const Setup = () => {
  useWebappSetup();
  return <></>;
};
