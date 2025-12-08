import { getApiClient } from '@ipc/index';
import { Song } from '@ipc/song/song.types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

type SongDeleteDialogProps = {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
};

const SongDeleteDialog = ({
  song,
  open,
  onOpenChange,
  onDelete,
}: SongDeleteDialogProps) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setDeleting(false);
    }
  }, [open]);

  const handleDelete = async () => {
    if (!song) return;

    setDeleting(true);
    setError(null);

    try {
      await getApiClient().deleteSong(song.name);
      setDeleting(false);
      onDelete();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete song');
      setDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Song</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{song?.name}&quot;? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="py-2">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongDeleteDialog;

