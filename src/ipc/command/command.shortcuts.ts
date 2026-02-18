import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '@ipc/utils/useShortcut';
import {
  commandPaletteOpenAtom,
  commandPaletteSelectedIndexAtom,
  commandPaletteResultsAtom,
} from './command.atoms';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
import { selectedSongAtom } from '@ipc/song/song.atoms';
import { selectedVerseReferenceAtom, versesHistoryAtom } from '@ipc/verse/verse.atoms';
import { BibleReferenceType } from '@ipc/verse/verse.types';

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
  
  const closePalette = useCallback(() => {
    if (open) {
      setOpen(false);
    }
  }, [open, setOpen]);
  
  useShortcut('Escape', closePalette);
};

const useCommandPaletteNavigationShortcuts = () => {
  const [open] = useAtom(commandPaletteOpenAtom);
  const [, setSelectedIndex] = useAtom(commandPaletteSelectedIndexAtom);
  const [results] = useAtom(commandPaletteResultsAtom);
  
  const navigateUp = useCallback(() => {
    if (!open) return;
    setSelectedIndex((prev: number) => Math.max(0, prev - 1));
  }, [open, setSelectedIndex]);
  
  const navigateDown = useCallback(() => {
    if (!open) return;
    setSelectedIndex((prev: number) => Math.min(results.length - 1, prev + 1));
  }, [open, setSelectedIndex, results.length]);
  
  useShortcut('ArrowUp', navigateUp);
  useShortcut('ArrowDown', navigateDown);
};

const useCommandPaletteSelectShortcut = () => {
  const [open, setOpen] = useAtom(commandPaletteOpenAtom);
  const [selectedIndex] = useAtom(commandPaletteSelectedIndexAtom);
  const [results] = useAtom(commandPaletteResultsAtom);
  const [, setSelectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setSelectedSong] = useAtom(selectedSongAtom);
  const [, setSelectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  const [, setVersesHistory] = useAtom(versesHistoryAtom);
  
  const selectItem = useCallback(() => {
    if (!open || results.length === 0) return;
    
    const selectedResult = results[selectedIndex];
    if (!selectedResult) return;
    
    if (selectedResult.type === 'song') {
      setSelectedTabType('songs');
      setSelectedSong(selectedResult.data);
      setOpen(false);
    } else if (selectedResult.type === 'verse') {
      const verseReference = selectedResult.data as BibleReferenceType;
      setSelectedTabType('bible');
      setSelectedVerseReference(verseReference);
      setVersesHistory((history) => {
        const exists = history.some(
          (item) =>
            item.book === verseReference.book &&
            item.chapter === verseReference.chapter &&
            item.verse === verseReference.verse,
        );
        if (exists) return history;
        return [...history, verseReference];
      });
      setOpen(false);
    }
  }, [
    open,
    selectedIndex,
    results,
    setSelectedTabType,
    setSelectedSong,
    setSelectedVerseReference,
    setVersesHistory,
    setOpen,
  ]);
  
  useShortcut('Enter', selectItem);
};

export const useCommandPaletteShortcuts = () => {
  useOpenCommandPaletteShortcut();
  useCloseCommandPaletteShortcut();
  useCommandPaletteNavigationShortcuts();
  useCommandPaletteSelectShortcut();
};
