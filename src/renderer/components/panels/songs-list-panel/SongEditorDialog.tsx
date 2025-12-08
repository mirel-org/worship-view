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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

type SongEditorDialogProps = {
  song: Song | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (newName?: string) => void;
};

const SongEditorDialog = ({
  song,
  open,
  onOpenChange,
  onSave,
}: SongEditorDialogProps) => {
  const [songName, setSongName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && song) {
      setSongName(song.name);
      setLoading(true);
      setError(null);
      getApiClient()
        .getSongContent(song.name)
        .then((songContent) => {
          setContent(songContent);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || 'Failed to load song content');
          setLoading(false);
        });
    } else if (!open) {
      setSongName('');
      setContent('');
      setError(null);
    }
  }, [open, song]);

  const handleSave = async () => {
    if (!song) return;

    if (!songName.trim()) {
      setError('Song name cannot be empty');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const nameChanged = songName.trim() !== song.name;
      
      // If name changed, rename the file first
      if (nameChanged) {
        await getApiClient().renameSong(song.name, songName.trim());
      }
      
      // Save the content (with the new name if renamed)
      await getApiClient().saveSong(songName.trim(), content);
      
      setSaving(false);
      onSave(nameChanged ? songName.trim() : undefined);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save song');
      setSaving(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Edit Song</DialogTitle>
          <DialogDescription>
            Edit the song name and content. Parts are separated by &quot;---&quot; and
            the last line contains the arrangement.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          <div className="space-y-2">
            <Label htmlFor="song-name">Song Name</Label>
            <Input
              id="song-name"
              value={songName}
              onChange={(e) => setSongName(e.target.value)}
              disabled={loading || saving}
            />
          </div>
          <div className="flex-1 overflow-hidden flex flex-col space-y-2">
            <Label htmlFor="song-content">Song Content</Label>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <>
                <textarea
                  id="song-content"
                  className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading || saving}
                />
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading || saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || saving || !songName.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongEditorDialog;

