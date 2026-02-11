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
import { useState, useEffect } from 'react';
import { useSaveSong } from '@renderer/hooks/useSongs';
import { useSongValidation } from '@renderer/hooks/useSongValidation';
import { validateSongContent } from '@renderer/lib/songParser';

type SongAddDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
};

const SongAddDialog = ({
  open,
  onOpenChange,
  onSave,
}: SongAddDialogProps) => {
  const [songName, setSongName] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const saveSongMutation = useSaveSong();
  const liveValidation = useSongValidation(content);

  useEffect(() => {
    if (open) {
      setSongName('');
      setContent('');
      setError(null);
    }
  }, [open]);

  const handleSave = async () => {
    if (!songName.trim()) {
      setError('Song name cannot be empty');
      return;
    }

    if (!content.trim()) {
      setError('Song content cannot be empty');
      return;
    }

    // Run synchronous validation on save
    const validation = validateSongContent(content);
    if (!validation.isValid) {
      setError(validation.errors.map((e) => e.message).join('; '));
      return;
    }

    setError(null);

    try {
      await saveSongMutation.mutateAsync({
        name: songName.trim(),
        content: content.trim(),
      });
      
      onSave();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save song');
    }
  };
  
  const saving = saveSongMutation.isLoading;

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Song</DialogTitle>
          <DialogDescription>
            Enter the song name and content. Parts are separated by &quot;---&quot; and
            the last line contains the arrangement.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="song-name">Song Name</Label>
            <Input
              id="song-name"
              value={songName}
              onChange={(e) => { setSongName(e.target.value); setError(null); }}
              disabled={saving}
              placeholder="Enter song name"
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col space-y-2">
            <Label htmlFor="song-content">Song Content</Label>
            <textarea
              id="song-content"
              className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(null); }}
              disabled={saving}
              placeholder="Enter song content..."
            />
            {error && (
              <p className="text-sm text-destructive" data-testid="song-validation-error">{error}</p>
            )}
            {liveValidation && liveValidation.errors.length > 0 && !error && (
              <div className="space-y-1" data-testid="song-validation-errors">
                {liveValidation.errors.map((e, i) => (
                  <p key={i} className="text-sm text-destructive">
                    {e.line ? `Line ${e.line}: ` : ''}{e.message}
                  </p>
                ))}
              </div>
            )}
            {liveValidation && liveValidation.warnings.length > 0 && (
              <div className="space-y-1" data-testid="song-validation-warnings">
                {liveValidation.warnings.map((w, i) => (
                  <p key={i} className="text-sm text-yellow-600 dark:text-yellow-500">
                    {w.line ? `Line ${w.line}: ` : ''}{w.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !songName.trim() || !content.trim()}
          >
            {saving ? 'Saving...' : 'Add Song'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongAddDialog;

