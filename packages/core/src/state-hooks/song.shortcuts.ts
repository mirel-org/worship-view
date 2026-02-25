import { useSongControll } from './song.hooks';
import { selectedTabTypeAtom } from '../state/tab.atoms';
import { commandPaletteOpenAtom } from '../state/command.atoms';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcuts from '../utils/useShortcuts';
import { shouldIgnoreNavigationShortcut } from '../utils/shortcut.guards';
import { songInputFocusAtom } from '../state/song.atoms';

const PREVIOUS_KEYS = ['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft'];
const NEXT_KEYS = ['s', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'];

const useSongShortcuts = () => {
  useSongControllerShortcuts();
  useStartSongSearchShortcut();
};
export default useSongShortcuts;

const useSongControllerShortcuts = () => {
  const { gotoNextSlide, gotoPreviousSlide } = useSongControll();
  const [selectedTabType] = useAtom(selectedTabTypeAtom);
  const [songInputFocus] = useAtom(songInputFocusAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);

  const next = useCallback((event: KeyboardEvent) => {
    if (shouldIgnoreNavigationShortcut(event)) return;

    if (selectedTabType === 'songs' && !songInputFocus && !commandPaletteOpen) {
      event.preventDefault();
      gotoNextSlide();
    }
  }, [selectedTabType, gotoNextSlide, songInputFocus, commandPaletteOpen]);
  const previous = useCallback((event: KeyboardEvent) => {
    if (shouldIgnoreNavigationShortcut(event)) return;

    if (selectedTabType === 'songs' && !songInputFocus && !commandPaletteOpen) {
      event.preventDefault();
      gotoPreviousSlide();
    }
  }, [selectedTabType, gotoPreviousSlide, songInputFocus, commandPaletteOpen]);
  useShortcuts(PREVIOUS_KEYS, previous);
  useShortcuts(NEXT_KEYS, next);
};

const useStartSongSearchShortcut = () => {
  // F1 shortcut is now handled by command palette
  // This function is kept for potential future use but does nothing
};
