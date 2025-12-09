import { useAtom } from 'jotai';
import React, { memo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Button } from './components/ui/button';
import Screens from './components/screens/Screens';
import { areScreensEnabledAtom } from '../ipc/screen/screen.atoms';
import Settings from './components/settings/Settings';
import { areSettingsOpenAtom } from '../ipc/settings/settings.atoms';
import AppTabs from './components/tabs/Tabs';
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
      <Setup />
    </>
  );
});

const Application: React.FC = () => {
  const [areScreensEnabled, setAreScreensEnabled] = useAtom(
    areScreensEnabledAtom,
  );
  const [, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-full p-2 box-border">
        <div className="h-[50px]">
          <Button
            variant="default"
            onClick={() => setAreScreensEnabled(!areScreensEnabled)}
          >
            Enable
          </Button>
          <Button variant="default" onClick={() => setAreSettingsOpen(true)}>
            Settings
          </Button>
        </div>
        <div className="h-[calc(100%-50px)]">
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
