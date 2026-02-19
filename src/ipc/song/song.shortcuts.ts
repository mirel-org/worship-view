import { useSongControll } from '@ipc/song/song.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { commandPaletteOpenAtom } from '@ipc/command/command.atoms';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcuts from '../utils/useShortcuts';
import { songInputFocusAtom } from './song.atoms';

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
    const isCmdkEvent =
      event.target instanceof Element && !!event.target.closest('[cmdk-root]');

    if (selectedTabType === 'songs' && !songInputFocus && !commandPaletteOpen)
      if (!isCmdkEvent) {
        event.preventDefault();
        gotoNextSlide();
      }
  }, [selectedTabType, gotoNextSlide, songInputFocus, commandPaletteOpen]);
  const previous = useCallback((event: KeyboardEvent) => {
    const isCmdkEvent =
      event.target instanceof Element && !!event.target.closest('[cmdk-root]');

    if (selectedTabType === 'songs' && !songInputFocus && !commandPaletteOpen)
      if (!isCmdkEvent) {
        event.preventDefault();
        gotoPreviousSlide();
      }
  }, [selectedTabType, gotoPreviousSlide, songInputFocus, commandPaletteOpen]);
  useShortcuts(['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft'], previous);
  useShortcuts(['s', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'], next);
};

const useStartSongSearchShortcut = () => {
  // F1 shortcut is now handled by command palette
  // This function is kept for potential future use but does nothing
};
