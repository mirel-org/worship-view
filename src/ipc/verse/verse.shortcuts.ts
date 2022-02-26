import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import useShortcut from '@ipc/utils/useShortcut';
import useShortcuts from '@ipc/utils/useShortcuts';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { verseInputFocusAtom } from './verse.atoms';
import { useVerseControll, useVerseSearch } from './verse.hooks';

const useVerseShortcuts = () => {
  useStartVerseSearchShortcut();
  useEndVerseSearchShortcut();
  useVerseControllShortcuts();
  useSearchUnfocusShortcut();
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

const useStartVerseSearchShortcut = () => {
  const [, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setVerseInputFocus] = useAtom(verseInputFocusAtom);
  const searchBible = useCallback(() => {
    setSelectedTabType('bible');
    setVerseInputFocus(true);
  }, [setSelectedTabType, setVerseInputFocus]);
  useShortcut('F2', searchBible);
};

const useEndVerseSearchShortcut = () => {
  const [verseInputFocus] = useAtom(verseInputFocusAtom);
  const { handleSearch } = useVerseSearch();

  const searchBible = useCallback(() => {
    if (!verseInputFocus) return;
    handleSearch();
  }, [verseInputFocus, handleSearch]);
  useShortcut('Enter', searchBible);
};

const useSearchUnfocusShortcut = () => {
  const [, setVerseInputFocus] = useAtom(verseInputFocusAtom);

  const unfocus = useCallback(() => {
    setVerseInputFocus(false);
  }, [setVerseInputFocus]);
  useShortcut('Escape', unfocus);
};
