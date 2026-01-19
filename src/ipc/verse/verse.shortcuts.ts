import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import useShortcuts from '@ipc/utils/useShortcuts';
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
  const next = useCallback(() => {
    if (!verseInputFocus && selectedTabType === 'bible') gotoNextVerse();
  }, [verseInputFocus, gotoNextVerse, selectedTabType]);
  const previous = useCallback(() => {
    if (!verseInputFocus && selectedTabType === 'bible') gotoPreviousVerse();
  }, [verseInputFocus, gotoPreviousVerse, selectedTabType]);
  useShortcuts(['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft'], previous);
  useShortcuts(['s', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'], next);
};
