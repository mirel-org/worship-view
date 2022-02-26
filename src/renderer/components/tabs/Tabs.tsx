import { Box, Tab, Tabs } from '@mui/material';
import { useAtom } from 'jotai';
import React, { FC } from 'react';
import styled from 'styled-components';
import TabsBible from './TabsBible';
import TabsSongs from './TabsSongs';
import { selectedTabTypeAtom } from '../../../ipc/tab/tab.atoms';

const TabsMap = {
  songs: <TabsSongs />,
  bible: <TabsBible />,
};

export type TabType = keyof typeof TabsMap;

const AppTabs: FC = () => {
  const [selectedTabType, setSelectedTabType] = useAtom(selectedTabTypeAtom);

  return (
    <Wrapper>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', height: '50px' }}>
        <Tabs
          value={selectedTabType}
          onChange={(_, value) => setSelectedTabType(value)}
          aria-label='basic tabs example'
        >
          <Tab label='Songs' value='songs' />
          <Tab label='Bible' value='bible' />
        </Tabs>
      </Box>
      <TabsWrapper>{TabsMap[selectedTabType]}</TabsWrapper>
    </Wrapper>
  );
};

export default AppTabs;

const Wrapper = styled.div`
  height: 100%;
`;

const TabsWrapper = styled.div`
  height: calc(100% - 50px);
`;
