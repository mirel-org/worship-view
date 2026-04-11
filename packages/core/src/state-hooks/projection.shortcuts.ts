import { useSongControll } from './song.hooks';
import { selectedTabTypeAtom } from '../state/tab.atoms';
import { verseInputFocusAtom } from '../state/verse.atoms';
import { commandPaletteOpenAtom } from '../state/command.atoms';
import { useVerseControll } from './verse.hooks';
import { useSession } from '../session/OperatorSessionContext';
import {
  enableVerseProjection,
  clearScreen,
} from '../session/session.actions';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '../utils/useShortcut';
import { shouldIgnoreNavigationShortcut } from '../utils/shortcut.guards';

const useProjectionShortcuts = () => {
  useEnableVerseShortcut();
  useClearScreenShortcut();
};

export default useProjectionShortcuts;

const useEnableVerseShortcut = () => {
  const session = useSession();
  const [verseInputFocus] = useAtom(verseInputFocusAtom);
  const [selectedTabType] = useAtom(selectedTabTypeAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);

  const enableVerse = useCallback((event: KeyboardEvent) => {
    if (shouldIgnoreNavigationShortcut(event)) return;
    if (!session) return;

    if (!verseInputFocus && selectedTabType === 'bible' && !commandPaletteOpen)
      enableVerseProjection(session);
  }, [
    session,
    verseInputFocus,
    selectedTabType,
    commandPaletteOpen,
  ]);

  useShortcut('Enter', enableVerse);
};

const useClearScreenShortcut = () => {
  const session = useSession();
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);

  const clear = useCallback((event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (shouldIgnoreNavigationShortcut(event)) return;
    if (commandPaletteOpen) return;
    if (!session) return;
    clearScreen(session);
  }, [session, commandPaletteOpen]);

  useShortcut('Escape', clear);
};
