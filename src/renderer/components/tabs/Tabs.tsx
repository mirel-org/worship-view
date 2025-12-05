import { useAtom } from 'jotai';
import React, { FC } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import TabsBible from './TabsBible';
import TabsSongs from './TabsSongs';
import { selectedTabTypeAtom } from '../../../ipc/tab/tab.atoms';
import TabsPrayer from './TabsPrayer';

const TabsMap = {
  songs: <TabsSongs />,
  bible: <TabsBible />,
  prayer: <TabsPrayer />,
};

export type TabType = keyof typeof TabsMap;

const AppTabs: FC = () => {
  const [selectedTabType, setSelectedTabType] = useAtom(selectedTabTypeAtom);

  return (
    <div className="h-full">
      <div className="border-b border-border h-[50px]">
        <Tabs
          value={selectedTabType}
          onValueChange={(value) => setSelectedTabType(value as TabType)}
        >
          <TabsList>
            <TabsTrigger value="songs">Songs</TabsTrigger>
            <TabsTrigger value="bible">Bible</TabsTrigger>
            <TabsTrigger value="prayer">Prayer</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="h-[calc(100%-50px)]">{TabsMap[selectedTabType]}</div>
    </div>
  );
};

export default AppTabs;
