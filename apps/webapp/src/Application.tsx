import { useAtom } from 'jotai';
import React, { memo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Menu, Search, Settings } from 'lucide-react';
import {
  areSettingsOpenAtom,
  selectedTabTypeAtom,
  commandPaletteOpenAtom,
  openSidebar,
  CommandPalette,
  AppTabs,
  Onboarding,
  AcceptInviteHandler,
} from '@worship-view/core';
import SettingsModal from './components/settings/Settings';
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

const Application: React.FC = () => {
  const [, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const [selectedTabType, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setCommandPaletteOpen] = useAtom(commandPaletteOpenAtom);

  return (
    <QueryClientProvider client={queryClient}>
      <Onboarding>
        <AcceptInviteHandler />
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
      </Onboarding>
    </QueryClientProvider>
  );
};

export default Application;

const Setup = () => {
  useWebappSetup();
  return <></>;
};
