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
    <div className="flex h-full bg-[#171717]">
      <div className="w-[300px] flex-none flex flex-col bg-[#0a0a0a]">
        <PanelGroup direction="vertical" autoSaveId="bible-tabs-panels">
          <Panel defaultSize={55} minSize={20}>
            <div className="h-full flex flex-col border-b border-white/10">
              <div className="flex h-10 items-center justify-between bg-[#262626] border-b border-white/10 pl-3 pr-2 flex-shrink-0">
                <span className="text-sm font-semibold text-[#fafafa]">Istoric Versete</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="h-7 rounded-md border border-white/10 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#fafafa] hover:bg-white/5"
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

          <PanelResizeHandle className="h-1 bg-white/10 transition-colors hover:bg-white/20" />

          <Panel defaultSize={45} minSize={20}>
            <div className="h-full flex flex-col">
              <div className="flex h-10 items-center justify-between bg-[#262626] border-b border-white/10 pl-3 pr-2 flex-shrink-0">
                <span className="text-sm font-semibold text-[#fafafa]">Media</span>
                <button
                  type="button"
                  onClick={handleUpload}
                  className="h-7 rounded-md bg-[#262626] px-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#fafafa] hover:bg-white/5"
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

      <div className="w-px h-full bg-white/10" />

      <div className="flex-1 overflow-hidden bg-[#0c0c0c] bg-[radial-gradient(circle,rgba(255,255,255,0.16)_1.5px,transparent_1.5px)] [background-size:31px_31px] [background-position:10px_12px]">
        <div className="h-full">
          <VersesPanel />
        </div>
      </div>
    </div>
  );
};

export default TabsBible;
