import { useSongControll } from '@ipc/song/song.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import useShortcut from '@ipc/utils/useShortcut';
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

  const next = useCallback(() => {
    if (selectedTabType === 'songs' && !songInputFocus) gotoNextSlide();
  }, [selectedTabType, gotoNextSlide, songInputFocus]);
  const previous = useCallback(() => {
    if (selectedTabType === 'songs' && !songInputFocus) gotoPreviousSlide();
  }, [selectedTabType, gotoPreviousSlide, songInputFocus]);
  useShortcuts(['w', 'W', 'ArrowUp', 'a', 'A', 'ArrowLeft'], previous);
  useShortcuts(['s', 'S', 'ArrowDown', 'd', 'D', 'ArrowRight'], next);
};

const useStartSongSearchShortcut = () => {
  const [, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setSongInputFocus] = useAtom(songInputFocusAtom);
  const searchSong = useCallback(() => {
    setSelectedTabType('songs');
    setSongInputFocus(true);
  }, [setSelectedTabType, setSongInputFocus]);
  useShortcut('F1', searchSong);
};
