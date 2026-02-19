import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { Upload, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { mediaUploadPickerRequestAtom } from '@ipc/media/media.atoms';
import { versesHistoryAtom } from '@ipc/verse/verse.atoms';
import { BibleVersesHistory } from '../panels/bible-verses-history/BibleVersesHistory';
import MediaPanel from '../panels/media-panel/MediaPanel';
import VersesPanel from '../panels/verses-panel/VersesPanel';

const TabsBible = () => {
  const [, setUploadRequest] = useAtom(mediaUploadPickerRequestAtom);
  const [, setVersesHistory] = useAtom(versesHistoryAtom);

  const handleUpload = () => {
    setUploadRequest((v) => v + 1);
  };

  const handleClearHistory = () => {
    setVersesHistory([]);
  };

  return (
    <div className="flex h-full bg-card">
      <div className="w-[300px] flex-none flex flex-col bg-background">
        <PanelGroup direction="vertical" autoSaveId="bible-tabs-panels">
          <Panel defaultSize={55} minSize={20}>
            <div className="h-full flex flex-col border-b border-border">
              <div className="flex h-10 items-center justify-between bg-muted border-b border-border pl-3 pr-2 flex-shrink-0">
                <span className="text-sm font-semibold text-foreground">Istoric Versete</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="h-7 rounded-md border border-border px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-accent/70"
                >
                  <X className="h-3.5 w-3.5" />
                  Golește
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <BibleVersesHistory />
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="h-1 bg-border transition-colors hover:bg-accent" />

          <Panel defaultSize={45} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="flex h-10 items-center justify-between bg-muted border-b border-border pl-3 pr-2 flex-shrink-0">
                <span className="text-sm font-semibold text-foreground">Media</span>
                <button
                  type="button"
                  onClick={handleUpload}
                  className="h-7 rounded-md bg-muted px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:bg-accent/70"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Încarcă
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <MediaPanel />
              </div>
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <div className="w-px h-full bg-border" />

      <div className="flex-1 overflow-hidden dot-grid-bg">
        <div className="h-full">
          <VersesPanel />
        </div>
      </div>
    </div>
  );
};

export default TabsBible;
