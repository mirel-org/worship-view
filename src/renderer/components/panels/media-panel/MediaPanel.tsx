import { selectedBackgroundMediaItemAtom } from '@ipc/media/media.atoms';
import { useGetMediaItems, useUploadMediaItem, useDeleteMediaItem } from '@renderer/hooks/useMedia';
import { validateMediaFile, type MediaItemResponse } from '@renderer/lib/jazz/media-store';
import { useAtom } from 'jotai';
import { FC, useRef, useState } from 'react';
import { Trash2, Upload, X } from 'lucide-react';
import { Progress } from '@renderer/components/ui/progress';
import { Button } from '@renderer/components/ui/button';
import MediaDeleteDialog from './MediaDeleteDialog';

const MediaPanel: FC = () => {
  const { data: mediaItems } = useGetMediaItems();
  const [selectedMediaItem, setSelectedMediaItem] = useAtom(selectedBackgroundMediaItemAtom);
  const uploadMedia = useUploadMediaItem();
  const deleteMedia = useDeleteMediaItem();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItemResponse | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset file input so the same file can be re-selected
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

  const errorMessage = validationError || uploadMedia.error?.message || deleteMedia.error?.message;

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden p-4">
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMedia.isLoading}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload
        </Button>
        {selectedMediaItem && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedMediaItem(null)}
          >
            <X className="h-4 w-4 mr-1" />
            Clear Background
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".mp4,.mov,.png,.jpg,.jpeg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {uploadMedia.isLoading && (
        <div className="mb-3">
          <Progress value={uploadMedia.progress * 100} className="h-2" />
          <span className="text-xs text-muted-foreground">
            Uploading... {Math.round(uploadMedia.progress * 100)}%
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-3 text-xs text-destructive">{errorMessage}</div>
      )}

      <ul className="space-y-1">
        {mediaItems.map((mediaItem) => (
          <li
            key={mediaItem.id}
            onClick={() => setSelectedMediaItem(mediaItem)}
            className={`cursor-pointer hover:bg-accent rounded-md p-2 transition-colors flex items-center justify-between group ${
              selectedMediaItem?.id === mediaItem.id ? 'bg-accent' : ''
            }`}
          >
            <span className="truncate">{mediaItem.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeleteTarget(mediaItem);
              }}
              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>

      <MediaDeleteDialog
        mediaItem={deleteTarget}
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
};

export default MediaPanel;
