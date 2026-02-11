import { useAtom } from 'jotai';
import { FC } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
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
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-2 bg-muted/20">
        <Tabs
          value={selectedTabType}
          onValueChange={(value) => setSelectedTabType(value as TabType)}
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="songs">Melodii</TabsTrigger>
            <TabsTrigger value="bible">Biblie</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-hidden bg-card">{TabsMap[selectedTabType]}</div>
    </div>
  );
};

export default AppTabs;
