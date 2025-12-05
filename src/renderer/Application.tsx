import { Button } from '@mui/material';
import { useAtom } from 'jotai';
import React, { memo } from 'react';
import { hot } from 'react-hot-loader';
import styled from 'styled-components';
import GlobalStyle from './components/helpers/GlobalStyle';
import Screens from './components/screens/Screens';
import { areScreensEnabledAtom } from '../ipc/screen/screen.atoms';
import Settings from './components/settings/Settings';
import { areSettingsOpenAtom } from '../ipc/settings/settings.atoms';
import AppTabs from './components/tabs/Tabs';
import { useSetup } from '../ipc/';

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

const Application: React.FC = () => {
  const [areScreensEnabled, setAreScreensEnabled] = useAtom(
    areScreensEnabledAtom,
  );
  const [, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);

  return (
    <AppWrapper>
      <Controlls>
        <Button
          variant='contained'
          onClick={() => setAreScreensEnabled(!areScreensEnabled)}
        >
          Enable
        </Button>
        <Button variant='contained' onClick={() => setAreSettingsOpen(true)}>
          Settings
        </Button>
      </Controlls>
      <TabsContainer>
        <AppTabs />
      </TabsContainer>
      <Generics />
    </AppWrapper>
  );
};

export default hot(module)(Application);

const AppWrapper = styled.div`
  height: 100%;
  padding: 8px;
  box-sizing: border-box;
`;

const Controlls = styled.div`
  height: 50px;
`;

const TabsContainer = styled.div`
  height: calc(100% - 50px);
`;

const Setup = () => {
  useSetup();
  return <></>;
};
