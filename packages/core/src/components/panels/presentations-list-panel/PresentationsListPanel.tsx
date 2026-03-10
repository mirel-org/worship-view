import { FC, useState } from 'react';
import { useAtom } from 'jotai';
import { Pencil, Trash2, Upload, Loader2, AlertTriangle, Presentation as PresentationIcon } from 'lucide-react';
import { Button } from '@worship-view/ui';
import {
  useGetPresentations,
  useDeletePresentation,
  useRenamePresentation,
} from '../../../hooks/usePresentation';
import { selectedPresentationAtom, selectedPresentationSlideIndexAtom } from '../../../state/presentation.atoms';
import PresentationDeleteDialog from './PresentationDeleteDialog';
import type { PresentationResponse } from '../../../jazz/presentation-store';
import type { UploadPhase } from '../../tabs/TabsPresentations';

const PHASE_LABELS: Record<UploadPhase, string> = {
  idle: 'Incarca',
  processing: 'Se proceseaza...',
  rendering: 'Se randeaza...',
  uploading: 'Se incarca...',
};

type Props = {
  onUploadClick: () => void;
  uploadPhase: UploadPhase;
  isBusy: boolean;
  libreOfficeInstalled: boolean | null;
  onLibreOfficePromptOpen: () => void;
};

const PresentationsListPanel: FC<Props> = ({ onUploadClick, uploadPhase, isBusy, libreOfficeInstalled, onLibreOfficePromptOpen }) => {
  const { data: presentations = [] } = useGetPresentations();
  const [selectedPresentation, setSelectedPresentation] = useAtom(selectedPresentationAtom);
  const [, setSlideIndex] = useAtom(selectedPresentationSlideIndexAtom);
  const deleteMutation = useDeletePresentation();
  const renameMutation = useRenamePresentation();

  const [deleteTarget, setDeleteTarget] = useState<PresentationResponse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleSelect = (presentation: PresentationResponse) => {
    setSelectedPresentation(presentation);
    setSlideIndex(0);
  };

  const handleDeleteClick = (e: React.MouseEvent, presentation: PresentationResponse) => {
    e.stopPropagation();
    setDeleteTarget(presentation);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      if (selectedPresentation?.id === deleteTarget.id) {
        setSelectedPresentation(null);
        setSlideIndex(null);
      }
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete presentation:', error);
    }
  };

  const handleRenameClick = (e: React.MouseEvent, presentation: PresentationResponse) => {
    e.stopPropagation();
    setRenamingId(presentation.id);
    setRenameValue(presentation.name);
  };

  const handleRenameSubmit = async (id: string) => {
    try {
      await renameMutation.mutateAsync({ id, newName: renameValue });
    } catch (error) {
      console.error('Failed to rename presentation:', error);
    }
    setRenamingId(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex h-10 items-center justify-between bg-muted border-b border-border pl-3 pr-2 flex-shrink-0">
        <span className="text-sm font-semibold text-foreground">Prezentari</span>
        <Button
          onClick={onUploadClick}
          disabled={isBusy}
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs"
        >
          {isBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          {PHASE_LABELS[uploadPhase]}
        </Button>
      </div>
      {libreOfficeInstalled === false && (
        <button
          type="button"
          onClick={onLibreOfficePromptOpen}
          className="flex items-center gap-2 px-3 py-2 bg-destructive/10 border-b border-destructive/20 text-xs text-destructive hover:bg-destructive/15 transition-colors text-left"
        >
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>LibreOffice nu este instalat. Apasati pentru detalii.</span>
        </button>
      )}
      <div className="flex-1 overflow-y-auto">
        {presentations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground text-sm p-4 text-center">
            <PresentationIcon className="h-8 w-8 opacity-50" />
            <p>Nicio prezentare</p>
            <p className="text-xs">Incarcati un fisier .pptx pentru a incepe</p>
          </div>
        ) : (
          <div className="p-1">
            {presentations.map((presentation) => (
              <button
                key={presentation.id}
                type="button"
                onClick={() => handleSelect(presentation)}
                className={`group w-full flex items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors ${
                  selectedPresentation?.id === presentation.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent/70'
                }`}
              >
                <PresentationIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  {renamingId === presentation.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={() => handleRenameSubmit(presentation.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit(presentation.id);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                      className="w-full bg-background border border-border rounded px-1 py-0 text-sm text-foreground"
                    />
                  ) : (
                    <span className="truncate block">{presentation.name}</span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {presentation.slideCount} slide{presentation.slideCount !== 1 ? '-uri' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleRenameClick(e, presentation)}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="Redenumeste"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, presentation)}
                    className="text-destructive hover:text-destructive"
                    aria-label="Sterge"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <PresentationDeleteDialog
        presentationName={deleteTarget?.name ?? null}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default PresentationsListPanel;
