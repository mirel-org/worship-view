import { selectedTabTypeAtom } from '../state/tab.atoms';
import { commandPaletteOpenAtom } from '../state/command.atoms';
import useShortcuts from '../utils/useShortcuts';
import { shouldIgnoreNavigationShortcut } from '../utils/shortcut.guards';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { verseInputFocusAtom } from '../state/verse.atoms';
import { useVerseControll } from './verse.hooks';

const PREVIOUS_KEYS = ['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft'];
const NEXT_KEYS = ['s', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'];

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
  useShortcuts(PREVIOUS_KEYS, previous);
  useShortcuts(NEXT_KEYS, next);
};
