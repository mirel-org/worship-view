import type { MediaItemResponse } from '@renderer/lib/jazz/media-store';
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

type MediaDeleteDialogProps = {
  mediaItem: MediaItemResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
};

const MediaDeleteDialog = ({
  mediaItem,
  open,
  onOpenChange,
  onDelete,
}: MediaDeleteDialogProps) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setDeleting(false);
    }
  }, [open]);

  const handleDelete = async () => {
    if (!mediaItem) return;

    setDeleting(true);
    setError(null);

    try {
      onDelete();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ștergerea media a eșuat');
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Șterge media</DialogTitle>
          <DialogDescription>
            Sigur doriți să ștergeți &quot;{mediaItem?.name}&quot;? Această acțiune nu
            poate fi anulată.
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
            onClick={() => onOpenChange(false)}
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

export default MediaDeleteDialog;
