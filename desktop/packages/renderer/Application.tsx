import { useAtom } from 'jotai';
import { memo, useState } from 'react';
import GlobalStyle from './components/helpers/GlobalStyle';
import Screens from './components/screens/Screens';
import { areScreensEnabledAtom } from '@ipc/screen/screen.atoms';
import Settings from './components/settings/Settings';
import { areSettingsOpenAtom } from '@ipc/settings/settings.atoms';
import AppTabs from './components/tabs/Tabs';
import { useSetup } from '@ipc/index';
import { QueryClient, QueryClientProvider } from 'react-query';
import { trpc } from '@common/trpc';
import styled from 'styled-components';
import { OliButton } from 'oli-design-system';

const Generics = memo(function Generics() {
  return (
    <>
      <GlobalStyle />
      <Screens />
      <Settings />
      <Setup />
    </>
  );
});

const Controlls = memo(function Controlls() {
  const [areScreensEnabled, setAreScreensEnabled] = useAtom(
    areScreensEnabledAtom,
  );
  const [, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  return (
    <>
      <OliButton
        onClick={() => setAreScreensEnabled(!areScreensEnabled)}
        text='Enable'
      />
      <OliButton onClick={() => setAreSettingsOpen(true)} text='Settings' />
    </>
  );
});

const Application = () => {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: 'http://localhost:5000/trpc',
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppWrapper>
          <ControllsWrapper>
            <Controlls />
          </ControllsWrapper>
          <TabsContainer>
            <AppTabs />
          </TabsContainer>
          <Generics />
        </AppWrapper>
      </QueryClientProvider>
    </trpc.Provider>
  );
};

export default Application;

const AppWrapper = styled('div')`
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
`;

const ControllsWrapper = styled('div')`
  height: 50px;
`;

const TabsContainer = styled('div')`
  height: calc(100% - 50px);
`;

const Setup = () => {
  useSetup();
  return <></>;
};
