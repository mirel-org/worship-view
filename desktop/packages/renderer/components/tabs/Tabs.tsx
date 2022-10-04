import { useAtom } from 'jotai';
import { FC } from 'react';
import styled from 'styled-components';
import TabsBible from './TabsBible';
import TabsSongs from './TabsSongs';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import TabsPrayer from './TabsPrayer';
import { OliButton } from 'oli-design-system';

const TabsMap = {
  songs: <TabsSongs />,
  bible: <TabsBible />,
  prayer: <TabsPrayer />,
};

export type TabType = keyof typeof TabsMap;

const AppTabs: FC = () => {
  const [, setSelectedTabType] = useAtom(selectedTabTypeAtom);

  return (
    <Wrapper>
      <OliButton text='Songs' onClick={() => setSelectedTabType('songs')} />
      <OliButton text='Bible' onClick={() => setSelectedTabType('bible')} />
      <OliButton text='Prayer' onClick={() => setSelectedTabType('prayer')} />
    </Wrapper>
  );
};

export default AppTabs;

const Wrapper = styled.div`
  height: 100%;
`;
