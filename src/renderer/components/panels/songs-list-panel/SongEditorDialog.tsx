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
import { useEffect, useState, useRef } from 'react';
import { useGetSongContent, useUpdateSong } from '@renderer/hooks/useSongs';
import { useSongValidation } from '@renderer/hooks/useSongValidation';
import { validateSongContent } from '@renderer/lib/songParser';

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
  const [error, setError] = useState<string | null>(null);
  const lastLoadedSongId = useRef<string | null>(null);
  const liveValidation = useSongValidation(content);
  
  const { data: songContent, isLoading: loading } = useGetSongContent(
    song?.id || ''
  );
  const updateSongMutation = useUpdateSong();

  useEffect(() => {
    if (open && song) {
      setSongName(song.name);
      setError(null);
      // Reset content only when opening with a different song
      if (lastLoadedSongId.current !== null && lastLoadedSongId.current !== song.id) {
        setContent('');
      }
    } else if (!open) {
      setSongName('');
      setContent('');
      setError(null);
      lastLoadedSongId.current = null;
    }
  }, [open, song]);

  useEffect(() => {
    // When dialog is open and we have song content, set it
    // This handles both fresh fetches and cached data
    if (open && song && songContent !== undefined && !loading) {
      setContent(songContent);
      lastLoadedSongId.current = song.id;
    }
  }, [open, song, songContent, loading]);

  const handleSave = async () => {
    if (!song) return;

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
      const nameChanged = songName.trim() !== song.name;
      
      // Always send the fullText update when saving
      // The user explicitly clicked save, so we should update the server
      const updates: { name?: string; fullText: string } = {
        fullText: content,
      };
      
      if (nameChanged) {
        updates.name = songName.trim();
      }

      console.log('Saving song:', { id: song.id, updates });
      const result = await updateSongMutation.mutateAsync({
        id: song.id,
        updates,
      });
      console.log('Save result:', result);
      
      onSave(nameChanged ? songName.trim() : undefined);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save song');
    }
  };
  
  const saving = updateSongMutation.isLoading;

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col">
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
              onChange={(e) => { setSongName(e.target.value); setError(null); }}
              disabled={loading || saving}
            />
          </div>
          <div className="flex-1 overflow-auto flex flex-col space-y-2">
            <Label htmlFor="song-content">Song Content</Label>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <textarea
                id="song-content"
                className="flex min-h-[500px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none"
                value={content}
                onChange={(e) => { setContent(e.target.value); setError(null); }}
                disabled={loading || saving}
              />
            )}
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
            disabled={loading || saving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || saving || !songName.trim() || !content.trim()}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SongEditorDialog;

