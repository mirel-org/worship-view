import { verseProjectionEnabledAtom } from '@ipc/projection/projection.atoms';
import { useSongControll } from '@ipc/song/song.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { verseInputFocusAtom } from '@ipc/verse/verse.atoms';
import { commandPaletteOpenAtom } from '@ipc/command/command.atoms';
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
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);
  const [, setVerseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const enableVerse = useCallback((event: KeyboardEvent) => {
    const isCmdkEvent =
      event.target instanceof Element && !!event.target.closest('[cmdk-root]');

    if (!verseInputFocus && selectedTabType === 'bible' && !commandPaletteOpen)
      if (!isCmdkEvent) setVerseProjectionEnabled(true);
  }, [
    verseInputFocus,
    setVerseProjectionEnabled,
    selectedTabType,
    commandPaletteOpen,
  ]);

  useShortcut('Enter', enableVerse);
};

const useClearScreenShortcut = () => {
  const { clearSong } = useSongControll();
  const { disableVerse } = useVerseControll();
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);
  const clear = useCallback((event: KeyboardEvent) => {
    const isCmdkEvent =
      event.target instanceof Element && !!event.target.closest('[cmdk-root]');

    if (isCmdkEvent) return;
    if (commandPaletteOpen) return;
    clearSong();
    disableVerse();
  }, [clearSong, disableVerse, commandPaletteOpen]);

  useShortcut('Escape', clear);
};
