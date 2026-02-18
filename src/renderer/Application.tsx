import { useAtom } from 'jotai';
import React, { memo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, Settings } from 'lucide-react';
import Screens from './components/screens/Screens';
import { areScreensEnabledAtom } from '../ipc/screen/screen.atoms';
import SettingsModal from './components/settings/Settings';
import { areSettingsOpenAtom } from '../ipc/settings/settings.atoms';
import AppTabs from './components/tabs/Tabs';
import { selectedTabTypeAtom } from '../ipc/tab/tab.atoms';
import { commandPaletteOpenAtom } from '../ipc/command/command.atoms';
import CommandPalette from './components/command-palette/CommandPalette';
import { AcceptInviteHandler } from './components/organizations/AcceptInviteHandler';
import { Onboarding } from './components/onboarding/Onboarding';
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
      <SettingsModal />
      <CommandPalette />
      <Setup />
    </>
  );
});

const Application: React.FC = () => {
  const [areScreensEnabled, setAreScreensEnabled] = useAtom(areScreensEnabledAtom);
  const [, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const [selectedTabType, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setCommandPaletteOpen] = useAtom(commandPaletteOpenAtom);

  return (
    <QueryClientProvider client={queryClient}>
      <Onboarding>
        <AcceptInviteHandler />
        <div
          className="h-full bg-[#0a0a0a] text-[#fafafa] antialiased selection:bg-white/20 selection:text-[#fafafa]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <div className="h-[50px] flex items-center justify-center gap-4 px-2">
            <div className="flex-1">
              <button
                type="button"
                onClick={() => setAreScreensEnabled(!areScreensEnabled)}
                className="inline-flex items-center gap-3"
                data-testid="enable-button"
              >
                <span
                  className={
                    areScreensEnabled
                      ? 'inline-flex h-6 w-11 items-center justify-end rounded-full border border-white/10 bg-[#e5e5e5] p-0.5 transition-colors'
                      : 'inline-flex h-6 w-11 items-center justify-start rounded-full border border-white/10 bg-[#262626] p-0.5 transition-colors'
                  }
                >
                  <span className="h-5 w-5 rounded-full bg-[#0a0a0a] shadow-[0_4px_13px_-3px_rgba(0,0,0,0.15),0_4px_5px_-2px_rgba(0,0,0,0.12)]" />
                </span>
                <span
                  className={
                    areScreensEnabled
                      ? 'rounded-2xl bg-[#ff666999] px-2 py-0.5 text-xs font-semibold text-[#fafafa]'
                      : 'rounded-2xl bg-[#262626] px-2 py-0.5 text-xs font-semibold text-[#a3a3a3]'
                  }
                >
                  LIVE
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="h-9 w-[340px] rounded-md border border-white/10 bg-[#0a0a0a] px-3 flex items-center gap-2 text-sm text-[#a3a3a3]"
              aria-label="Deschide paleta de comenzi"
            >
              <Search className="h-4 w-4 text-[#a3a3a3]" />
              <span className="truncate flex-1 text-left text-sm text-[#a3a3a3]">
                Caută cântece, versete sau comenzi...
              </span>
              <span className="h-5 rounded border border-white/10 bg-[#262626] px-1.5 text-[10px] font-medium leading-5 text-[#a3a3a3]">
                F2
              </span>
            </button>

            <div className="flex-1 flex items-center justify-end gap-4">
              <div className="h-10 rounded-md bg-[#262626] p-1 inline-flex items-center gap-2 border border-white/10">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedTabType === 'songs'}
                  data-state={selectedTabType === 'songs' ? 'active' : 'inactive'}
                  onClick={() => setSelectedTabType('songs')}
                  className={
                    selectedTabType === 'songs'
                      ? 'h-8 px-3 rounded-[2px] bg-[#0a0a0a] text-[#fafafa] text-sm font-medium shadow-[0_1px_1.75px_rgba(0,0,0,0.05)]'
                      : 'h-8 px-3 rounded-[2px] text-[#a3a3a3] text-sm font-medium'
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
                      ? 'h-8 px-3 rounded-[2px] bg-[#0a0a0a] text-[#fafafa] text-sm font-medium shadow-[0_1px_1.75px_rgba(0,0,0,0.05)]'
                      : 'h-8 px-3 rounded-[2px] text-[#a3a3a3] text-sm font-medium'
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
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#fafafa] hover:bg-white/5"
              >
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-50px)] overflow-hidden bg-[#171717]">
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
  useSetup();
  return <></>;
};
