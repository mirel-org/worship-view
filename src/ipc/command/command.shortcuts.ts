import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '@ipc/utils/useShortcut';
import { commandPaletteOpenAtom } from './command.atoms';

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

export const useCommandPaletteShortcuts = () => {
  useOpenCommandPaletteShortcut();
  useCloseCommandPaletteShortcut();
};
