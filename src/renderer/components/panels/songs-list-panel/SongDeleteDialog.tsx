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
      // The actual deletion is handled by the parent component
      // This just triggers the callback
      onDelete();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ștergerea cântecului a eșuat');
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
          <DialogTitle>Șterge cântec</DialogTitle>
          <DialogDescription>
            Sigur doriți să ștergeți &quot;{song?.name}&quot;? Această acțiune nu poate
            fi anulată.
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
            Anulează
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Se șterge...' : 'Șterge'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongDeleteDialog;

