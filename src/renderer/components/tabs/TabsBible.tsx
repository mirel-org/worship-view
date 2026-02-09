import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { BibleVersesHistory } from '../panels/bible-verses-history/BibleVersesHistory';
import MediaPanel from '../panels/media-panel/MediaPanel';
import VersesPanel from '../panels/verses-panel/VersesPanel';

const TabsBible = () => {
  return (
    <div className="flex h-full">
      <div className="w-[300px] flex-none flex flex-col overflow-hidden">
        <PanelGroup direction="vertical" autoSaveId="bible-tabs-panels">
          {/* Bible Verses History Panel */}
          <Panel defaultSize={50} minSize={20}>
            <div className="h-full flex flex-col border-b border-border">
              <div className="flex-1 overflow-hidden">
                <BibleVersesHistory />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="h-1 bg-border hover:bg-primary/50 transition-colors" />

          {/* Media Panel */}
          <Panel defaultSize={50} minSize={20}>
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
      <div className="flex-1 flex flex-col items-center">
        <div className="w-[90%] h-full">
          <VersesPanel />
        </div>
      </div>
    </div>
  );
};

export default TabsBible;
