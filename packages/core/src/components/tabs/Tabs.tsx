import { useAtom } from 'jotai';
import { FC } from 'react';
import TabsBible from './TabsBible';
import TabsSongs from './TabsSongs';
import TabsPresentations from './TabsPresentations';
import { selectedTabTypeAtom } from '../../state/tab.atoms';

const TabsMap = {
  songs: <TabsSongs />,
  bible: <TabsBible />,
  presentations: <TabsPresentations />,
};

export type TabType = keyof typeof TabsMap;

const AppTabs: FC = () => {
  const [selectedTabType] = useAtom(selectedTabTypeAtom);

  return <div className="h-full flex flex-col">{TabsMap[selectedTabType]}</div>;
};

export default AppTabs;
