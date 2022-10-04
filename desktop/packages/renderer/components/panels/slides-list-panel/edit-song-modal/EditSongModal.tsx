import { isEditingSongAtom, selectedSongAtom } from '@ipc/song/song.atoms';
import { useAtom } from 'jotai';
import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';
import { songToText } from '@ipc/song/song.utils';
import { OliModal } from 'oli-design-system';

export function EditSongModal() {
  const [isEditingSong, setIsEditingSong] = useAtom(isEditingSongAtom);
  const [selectedSong] = useAtom(selectedSongAtom);
  const [value, setValue] = useState<string>('');
  useEffect(() => {
    selectedSong && setValue(songToText(selectedSong));
  }, [selectedSong, setValue]);

  return (
    <OliModal
      open={isEditingSong && !!selectedSong}
      onClose={() => setIsEditingSong(false)}
    >
      <Editor
        height='90vh'
        language='text'
        value={value}
        onChange={(v) => v && setValue(v)}
      />
    </OliModal>
  );
}
