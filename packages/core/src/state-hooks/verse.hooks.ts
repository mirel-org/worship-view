import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import { useSession } from '../session/OperatorSessionContext';
import {
  disableVerseProjection,
  gotoNextVerse as gotoNextVerseAction,
  gotoPrevVerse as gotoPrevVerseAction,
} from '../session/session.actions';
import {
  verseInputReferenceAtom,
  versesHistoryAtom,
} from '../state/verse.atoms';

export const useVerseControll = () => {
  const session = useSession();

  const disableVerse = useCallback(() => {
    if (!session) return;
    disableVerseProjection(session);
  }, [session]);

  const gotoNextVerse = useCallback(() => {
    if (!session) return;
    gotoNextVerseAction(session);
  }, [session]);

  const gotoPreviousVerse = useCallback(() => {
    if (!session) return;
    gotoPrevVerseAction(session);
  }, [session]);

  return { disableVerse, gotoNextVerse, gotoPreviousVerse };
};

export const useVersesHistory = () => {
  const [, setVersesHistory] = useAtom(versesHistoryAtom);
  const [verseInputReference] = useAtom(verseInputReferenceAtom);

  useEffect(() => {
    verseInputReference &&
      setVersesHistory((versesHistory) => [
        ...versesHistory,
        verseInputReference,
      ]);
  }, [verseInputReference, setVersesHistory]);
};
