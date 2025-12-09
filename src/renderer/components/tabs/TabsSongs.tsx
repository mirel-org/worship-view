import { FC } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import MediaPanel from '../panels/media-panel/MediaPanel';
import SlidesListPanel from '../panels/slides-list-panel/SlidesListPanel';
import ServiceListSection from '../panels/songs-list-panel/ServiceListSection';

const TabsSongs: FC = () => {

  return (
    <div className="flex h-full">
      <div className="w-[300px] flex-none flex flex-col overflow-hidden">
        <PanelGroup direction="vertical" autoSaveId="songs-tabs-panels">
          {/* Service List Panel */}
          <Panel
            defaultSize={50}
            minSize={20}
          >
            <div className="h-full flex flex-col border-b border-border">
              <div className="flex items-center justify-between px-2 py-1 bg-muted/50 border-b border-border flex-shrink-0">
                <span className="text-sm font-semibold">Service List</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <ServiceListSection />
              </div>
            </div>
          </Panel>
          
          <PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Media Panel */}
          <Panel
            defaultSize={50}
            minSize={20}
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-2 py-1 bg-muted/50 border-b border-border flex-shrink-0">
                <span className="text-sm font-semibold">Media</span>
              </div>
              <div className="flex-1 overflow-hidden">
                <MediaPanel />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>
      <div className="flex-1">
        <SlidesListPanel />
      </div>
    </div>
  );
};

export default TabsSongs;
