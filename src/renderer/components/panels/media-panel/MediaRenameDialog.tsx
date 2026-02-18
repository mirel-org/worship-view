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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

type MediaRenameDialogProps = {
  mediaItem: MediaItemResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRename: (newName: string) => Promise<void>;
};

const MediaRenameDialog = ({
  mediaItem,
  open,
  onOpenChange,
  onRename,
}: MediaRenameDialogProps) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && mediaItem) {
      setName(mediaItem.name);
      setError(null);
      setSaving(false);
    }
    if (!open) {
      setError(null);
      setSaving(false);
    }
  }, [open, mediaItem]);

  const handleSave = async () => {
    if (!mediaItem) return;

    const trimmed = name.trim();
    if (!trimmed) {
      setError('Numele media nu poate fi gol');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onRename(trimmed);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Redenumirea media a eșuat');
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redenumește media</DialogTitle>
          <DialogDescription>
            Introduceți un nume nou pentru &quot;{mediaItem?.name}&quot;.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="media-name">Nume</Label>
          <Input
            id="media-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            disabled={saving}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Se salvează...' : 'Salvează'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MediaRenameDialog;
