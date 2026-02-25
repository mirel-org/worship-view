import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '../utils/useShortcut';
import {
  commandPaletteOpenAtom,
  commandPaletteSelectedIndexAtom,
  commandPaletteResultsAtom,
} from '../state/command.atoms';
import { selectedTabTypeAtom } from '../state/tab.atoms';
import { selectedSongAtom } from '../state/song.atoms';
import { selectedVerseReferenceAtom, versesHistoryAtom } from '../state/verse.atoms';
import { BibleReferenceType } from '../types/verse.types';

const useOpenCommandPaletteShortcut = () => {
  const [, setOpen] = useAtom(commandPaletteOpenAtom);

  const openPalette = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  // F1 and F2 both open the command palette
  useShortcut('F1', openPalette);
  useShortcut('F2', openPalette);
};

const useCloseCommandPaletteShortcut = () => {
  const [open, setOpen] = useAtom(commandPaletteOpenAtom);

  const closePalette = useCallback((event: KeyboardEvent) => {
    if (open) {
      event.preventDefault();
      setOpen(false);
    }
  }, [open, setOpen]);

  useShortcut('Escape', closePalette);
};

export const useCommandPaletteShortcuts = () => {
  useOpenCommandPaletteShortcut();
  useCloseCommandPaletteShortcut();
};
