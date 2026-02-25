import { verseProjectionEnabledAtom } from '../state/projection.atoms';
import { useSongControll } from './song.hooks';
import { selectedTabTypeAtom } from '../state/tab.atoms';
import { verseInputFocusAtom } from '../state/verse.atoms';
import { commandPaletteOpenAtom } from '../state/command.atoms';
import { useVerseControll } from './verse.hooks';
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
