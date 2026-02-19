import {
  mediaUploadPickerRequestAtom,
  selectedBackgroundMediaItemAtom,
} from '@ipc/media/media.atoms';
import {
  useGetMediaItems,
  useUploadMediaItem,
  useDeleteMediaItem,
  useMediaBlobUrl,
  useRenameMediaItem,
} from '@renderer/hooks/useMedia';
import { validateMediaFile, type MediaItemResponse } from '@renderer/lib/jazz/media-store';
import { useAtom } from 'jotai';
import { FC, useEffect, useRef, useState } from 'react';
import { ImageOff, Pencil, Trash2 } from 'lucide-react';
import { Progress } from '@renderer/components/ui/progress';
import { cn } from '@renderer/lib/utils';
import MediaDeleteDialog from './MediaDeleteDialog';
import MediaRenameDialog from './MediaRenameDialog';

const MediaGridItem: FC<{
  mediaItem: MediaItemResponse;
  selected: boolean;
  onSelect: () => void;
  onRename: () => void;
  onDelete: () => void;
}> = ({ mediaItem, selected, onSelect, onRename, onDelete }) => {
  const { blobUrl } = useMediaBlobUrl(mediaItem.fileStreamId);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group overflow-hidden rounded-md border bg-card text-left transition-colors shadow-[0_1px_4px_rgba(0,0,0,0.25)]',
        selected
          ? 'border-2 border-ring shadow-[0_0_0_1px_hsl(var(--ring)/0.35),0_8px_20px_rgba(0,0,0,0.22)]'
          : 'border-border hover:border-ring/60'
      )}
    >
      <div className="h-20 w-full bg-muted">
        {blobUrl ? (
          mediaItem.mediaType === 'video' ? (
            <video
              src={blobUrl}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
          ) : (
            <img
              src={blobUrl}
              alt={mediaItem.name}
              className="h-full w-full object-cover"
            />
          )
        ) : (
          <div className="h-full w-full" />
        )}
      </div>
      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
        <span className="truncate text-[11px] font-medium text-foreground">{mediaItem.name}</span>
        <div className="flex items-center gap-0.5">
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRename();
            }}
            className="rounded p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent/70"
            aria-label={`Redenumește ${mediaItem.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </span>
          <span
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-destructive opacity-0 group-hover:opacity-100 hover:bg-accent/70"
            aria-label={`Șterge ${mediaItem.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
};

const ClearBackgroundItem: FC<{ selected: boolean; onSelect: () => void }> = ({
  selected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group overflow-hidden rounded-md border bg-card text-left transition-colors',
        selected ? 'border-2 border-ring' : 'border-border hover:border-ring/60'
      )}
    >
      <div className="h-20 w-full bg-muted flex items-center justify-center">
        <ImageOff className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="px-2 py-1.5">
        <span className="truncate text-[11px] font-medium text-foreground">Fără fundal</span>
      </div>
    </button>
  );
};

const MediaPanel: FC = () => {
  const { data: mediaItems } = useGetMediaItems();
  const [selectedMediaItem, setSelectedMediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  const [uploadRequest] = useAtom(mediaUploadPickerRequestAtom);
  const uploadMedia = useUploadMediaItem();
  const renameMedia = useRenameMediaItem();
  const deleteMedia = useDeleteMediaItem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<MediaItemResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItemResponse | null>(null);

  useEffect(() => {
    if (uploadRequest > 0) {
      fileInputRef.current?.click();
    }
  }, [uploadRequest]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      setValidationError(validation.error!);
      return;
    }

    setValidationError(null);
    try {
      await uploadMedia.mutateAsync(file);
    } catch {
      // Error is already set in the hook
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!renameTarget) return;
    await renameMedia.mutateAsync({ id: renameTarget.id, newName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (selectedMediaItem?.id === deleteTarget.id) {
        setSelectedMediaItem(null);
      }
      await deleteMedia.mutateAsync(deleteTarget.id);
    } catch {
      // Error is already set in the hook
    }
  };

  const errorMessage =
    validationError ||
    uploadMedia.error?.message ||
    renameMedia.error?.message ||
    deleteMedia.error?.message;

  return (
    <div className="h-full overflow-y-auto p-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.mov,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadMedia.isLoading && (
        <div className="mb-2">
          <Progress value={uploadMedia.progress * 100} className="h-1.5" />
          <span className="text-[11px] text-muted-foreground">
            Se încarcă... {Math.round(uploadMedia.progress * 100)}%
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-2 text-[11px] text-destructive">{errorMessage}</div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <ClearBackgroundItem
          selected={selectedMediaItem === null}
          onSelect={() => setSelectedMediaItem(null)}
        />
        {mediaItems.map((mediaItem) => (
          <MediaGridItem
            key={mediaItem.id}
            mediaItem={mediaItem}
            selected={selectedMediaItem?.id === mediaItem.id}
            onSelect={() => setSelectedMediaItem(mediaItem)}
            onRename={() => setRenameTarget(mediaItem)}
            onDelete={() => setDeleteTarget(mediaItem)}
          />
        ))}
      </div>

      <MediaRenameDialog
        mediaItem={renameTarget}
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null);
        }}
        onRename={handleRenameConfirm}
      />

      <MediaDeleteDialog
        mediaItem={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default MediaPanel;
