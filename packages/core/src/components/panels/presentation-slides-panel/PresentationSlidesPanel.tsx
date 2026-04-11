import { FC, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@worship-view/ui';
import { usePresentationSlideBlobUrl, useDeletePresentationSlide } from '../../../hooks/usePresentation';
import type { PresentationSlideResponse } from '../../../jazz/presentation-store';
import VideoControls from './VideoControls';
import { useSession } from '../../../session/OperatorSessionContext';
import {
  useSessionPresentation,
  useSessionPresentationSlideIndex,
  useSessionPresentationSlide,
} from '../../../session/session.hooks';
import {
  selectPresentation,
  setPresentationSlideIndex,
  clearPresentation,
} from '../../../session/session.actions';

const SlideThumbnail: FC<{
  slide: PresentationSlideResponse;
  isSelected: boolean;
  onClick: () => void;
  onDeleteClick: () => void;
}> = ({ slide, isSelected, onClick, onDeleteClick }) => {
  const { blobUrl } = usePresentationSlideBlobUrl(slide.fileStreamId);

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        className={`relative w-full aspect-video rounded-lg border-2 overflow-hidden transition-all ${
          isSelected
            ? 'border-primary ring-2 ring-primary/30 shadow-md'
            : 'border-border hover:border-accent'
        }`}
      >
        {blobUrl ? (
          slide.slideType === 'video' ? (
            <div className="w-full h-full bg-black flex items-center justify-center">
              <video src={blobUrl} className="w-full h-full object-contain" muted />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
          ) : (
            <img
              src={blobUrl}
              alt={`Slide ${slide.index + 1}`}
              className="w-full h-full object-contain bg-black"
            />
          )
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-xs text-muted-foreground">Se incarca...</span>
          </div>
        )}
        <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
          {slide.index + 1}
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDeleteClick();
        }}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
        aria-label={`Sterge slide ${slide.index + 1}`}
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};

const PresentationSlidesPanel: FC = () => {
  const session = useSession();
  const selectedPresentation = useSessionPresentation();
  const selectedSlideIndex = useSessionPresentationSlideIndex();
  const selectedSlide = useSessionPresentationSlide();
  const deleteSlideMutation = useDeletePresentationSlide();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(null);

  if (!selectedPresentation) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
        Selectati o prezentare din lista din stanga
      </div>
    );
  }

  const handleDeleteClick = (slideIndex: number) => {
    setDeleteTargetIndex(slideIndex);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetIndex === null || !session) return;
    try {
      const result = await deleteSlideMutation.mutateAsync({
        presentationId: selectedPresentation.id,
        slideIndex: deleteTargetIndex,
      });
      if (result.updatedPresentation) {
        // Re-select the presentation to get updated data
        selectPresentation(session, result.updatedPresentation.id);
        if (result.updatedPresentation.slides.length === 0) {
          clearPresentation(session);
        } else if (selectedSlideIndex !== null && selectedSlideIndex >= result.updatedPresentation.slides.length) {
          setPresentationSlideIndex(session, result.updatedPresentation.slides.length - 1);
        }
      }
    } catch (error) {
      console.error('Failed to delete slide:', error);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetIndex(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {selectedPresentation.slides.map((slide) => (
            <SlideThumbnail
              key={slide.index}
              slide={slide}
              isSelected={selectedSlideIndex === slide.index}
              onClick={() => {
                if (session) setPresentationSlideIndex(session, slide.index);
              }}
              onDeleteClick={() => handleDeleteClick(slide.index)}
            />
          ))}
        </div>
      </div>
      {selectedSlide?.slideType === 'video' && <VideoControls />}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sterge slide-ul</DialogTitle>
            <DialogDescription>
              Sigur doriti sa stergeti slide-ul {deleteTargetIndex !== null ? deleteTargetIndex + 1 : ''}? Aceasta actiune nu poate fi anulata.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Anuleaza
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Sterge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PresentationSlidesPanel;
