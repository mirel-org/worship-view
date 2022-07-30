import { isEditingSongAtom, selectedSongAtom } from '@ipc/song/song.atoms';
import { Dialog, DialogContent } from '@mui/material';
import { useAtom } from 'jotai';
import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { songToText } from '@ipc/song/song.utils';

export function EditSongModal() {
  const [isEditingSong, setIsEditingSong] = useAtom(isEditingSongAtom);
  const [selectedSong] = useAtom(selectedSongAtom);
  const [value, setValue] = useState<string>('');
  useEffect(() => {
    selectedSong && setValue(songToText(selectedSong));
  }, [selectedSong, setValue]);

  return (
    <Dialog
      open={isEditingSong && !!selectedSong}
      onClose={() => setIsEditingSong(false)}
      fullWidth
    >
      <DialogContent>
        <Editor
          height='90vh'
          language='text'
          value={value}
          onChange={(v) => v && setValue(v)}
        />
      </DialogContent>
    </Dialog>
  );
}
