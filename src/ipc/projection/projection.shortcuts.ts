import { verseProjectionEnabledAtom } from '@ipc/projection/projection.atoms';
import { useSongControll } from '@ipc/song/song.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { verseInputFocusAtom } from '@ipc/verse/verse.atoms';
import { commandPaletteOpenAtom } from '@ipc/command/command.atoms';
import { useVerseControll } from '@ipc/verse/verse.hooks';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '../utils/useShortcut';
import { shouldIgnoreNavigationShortcut } from '../utils/shortcut.guards';

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
    if (shouldIgnoreNavigationShortcut(event)) return;

    if (!verseInputFocus && selectedTabType === 'bible' && !commandPaletteOpen)
      setVerseProjectionEnabled(true);
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
    if (event.defaultPrevented) return;
    if (shouldIgnoreNavigationShortcut(event)) return;
    if (commandPaletteOpen) return;
    clearSong();
    disableVerse();
  }, [clearSong, disableVerse, commandPaletteOpen]);

  useShortcut('Escape', clear);
};
