import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { commandPaletteOpenAtom } from '@ipc/command/command.atoms';
import useShortcuts from '@ipc/utils/useShortcuts';
import { shouldIgnoreNavigationShortcut } from '@ipc/utils/shortcut.guards';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { verseInputFocusAtom } from './verse.atoms';
import { useVerseControll } from './verse.hooks';

const useVerseShortcuts = () => {
  useVerseControllShortcuts();
};

export default useVerseShortcuts;

const useVerseControllShortcuts = () => {
  const { gotoNextVerse, gotoPreviousVerse } = useVerseControll();
  const [selectedTabType] = useAtom(selectedTabTypeAtom);
  const [verseInputFocus] = useAtom(verseInputFocusAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);
  const next = useCallback((event: KeyboardEvent) => {
    if (shouldIgnoreNavigationShortcut(event)) return;

    if (!verseInputFocus && selectedTabType === 'bible' && !commandPaletteOpen)
      gotoNextVerse();
  }, [verseInputFocus, gotoNextVerse, selectedTabType, commandPaletteOpen]);
  const previous = useCallback((event: KeyboardEvent) => {
    if (shouldIgnoreNavigationShortcut(event)) return;

    if (!verseInputFocus && selectedTabType === 'bible' && !commandPaletteOpen)
      gotoPreviousVerse();
  }, [verseInputFocus, gotoPreviousVerse, selectedTabType, commandPaletteOpen]);
  useShortcuts(['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft'], previous);
  useShortcuts(['s', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'], next);
};
