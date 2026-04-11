import { FC, useState, useCallback, useEffect } from 'react';
import { useUploadPresentation } from '../../hooks/usePresentation';
import { renderPdfPages } from '../../utils/pdf-renderer';
import PresentationsListPanel from '../panels/presentations-list-panel/PresentationsListPanel';
import PresentationSlidesPanel from '../panels/presentation-slides-panel/PresentationSlidesPanel';
import LibreOfficePrompt from '../presentations/LibreOfficePrompt';
import Sidebar from '../layout/Sidebar';
import type { UploadSlideInput } from '../../jazz/presentation-store';
import { useSessionPresentation } from '../../session/session.hooks';

export type UploadPhase = 'idle' | 'processing' | 'rendering' | 'uploading';

declare global {
  interface Window {
    myAPI: {
      checkLibreOffice: () => Promise<{ installed: boolean; path?: string }>;
      selectPptxFile: () => Promise<string | null>;
      preparePresentation: (filePath: string) => Promise<{
        name: string;
        pdfData: ArrayBuffer;
        videos: { slideIndex: number; mimeType: string; data: ArrayBuffer }[];
      }>;
      [key: string]: any;
    };
  }
}

const TabsPresentations: FC = () => {
  const selectedPresentation = useSessionPresentation();
  const uploadMutation = useUploadPresentation();
  const [libreOfficePromptOpen, setLibreOfficePromptOpen] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>('idle');
  const [libreOfficeInstalled, setLibreOfficeInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    window.myAPI.checkLibreOffice().then((result) => {
      setLibreOfficeInstalled(result.installed);
    }).catch(() => {
      setLibreOfficeInstalled(false);
    });
  }, []);

  const handleUpload = useCallback(async () => {
    try {
      // Re-check in case user installed it since mount
      const loCheck = await window.myAPI.checkLibreOffice();
      if (!loCheck.installed) {
        setLibreOfficeInstalled(false);
        setLibreOfficePromptOpen(true);
        return;
      }
      setLibreOfficeInstalled(true);

      // Select file
      const filePath = await window.myAPI.selectPptxFile();
      if (!filePath) return;

      // Phase 1: Processing PPTX (main process: convert to PDF + extract videos)
      setUploadPhase('processing');
      const prepared = await window.myAPI.preparePresentation(filePath);

      // Phase 2: Rendering PDF pages to images (renderer process)
      setUploadPhase('rendering');
      const renderedPages = await renderPdfPages(prepared.pdfData);

      // Build video lookup
      const videoMap = new Map(
        prepared.videos.map((v) => [v.slideIndex, v]),
      );

      // Combine: video slides replace image slides
      const slides: UploadSlideInput[] = renderedPages.map((page) => {
        const video = videoMap.get(page.index);
        if (video) {
          return {
            index: page.index,
            type: 'video' as const,
            mimeType: video.mimeType,
            data: video.data,
          };
        }
        return {
          index: page.index,
          type: 'image' as const,
          mimeType: page.mimeType,
          data: page.data,
        };
      });

      // Phase 3: Uploading to Jazz
      setUploadPhase('uploading');
      await uploadMutation.mutateAsync(prepared.name, slides);
    } catch (error) {
      console.error('Failed to upload presentation:', error);
    } finally {
      setUploadPhase('idle');
    }
  }, [uploadMutation]);

  const isBusy = uploadPhase !== 'idle';

  return (
    <div className="flex h-full bg-card">
      <Sidebar>
        <PresentationsListPanel
          onUploadClick={handleUpload}
          uploadPhase={uploadPhase}
          isBusy={isBusy}
          libreOfficeInstalled={libreOfficeInstalled}
          onLibreOfficePromptOpen={() => setLibreOfficePromptOpen(true)}
        />
      </Sidebar>

      <div className="hidden lg:block w-px h-full bg-border" />

      <div className="flex-1 min-w-0 flex flex-col">
        {selectedPresentation && (
          <div className="h-10 border-b border-border bg-muted flex items-center justify-between pl-4 pr-3">
            <span className="text-sm font-semibold text-foreground">
              {selectedPresentation.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedPresentation.slideCount} slide{selectedPresentation.slideCount !== 1 ? '-uri' : ''}
            </span>
          </div>
        )}
        <div className="flex-1 overflow-hidden dot-grid-bg">
          <PresentationSlidesPanel />
        </div>
      </div>
      <LibreOfficePrompt
        open={libreOfficePromptOpen}
        onOpenChange={setLibreOfficePromptOpen}
      />
    </div>
  );
};

export default TabsPresentations;
