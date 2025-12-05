import { verseProjectionEnabledAtom } from '@ipc/projection/projection.atoms';
import { useSongControll } from '@ipc/song/song.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { verseInputFocusAtom } from '@ipc/verse/verse.atoms';
import { useVerseControll } from '@ipc/verse/verse.hooks';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '../utils/useShortcut';

const useProjectionShortcuts = () => {
  useEnableVerseShortcut();
  useClearScreenShortcut();
};

export default useProjectionShortcuts;

const useEnableVerseShortcut = () => {
  const [verseInputFocus] = useAtom(verseInputFocusAtom);
  const [selectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setVerseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const enableVerse = useCallback(() => {
    if (!verseInputFocus && selectedTabType === 'bible')
      setVerseProjectionEnabled(true);
  }, [verseInputFocus, setVerseProjectionEnabled, selectedTabType]);

  useShortcut('Enter', enableVerse);
};

const useClearScreenShortcut = () => {
  const { clearSong } = useSongControll();
  const { disableVerse } = useVerseControll();
  const clear = useCallback(() => {
    clearSong();
    disableVerse();
  }, [clearSong, disableVerse]);

  useShortcut('Escape', clear);
};
