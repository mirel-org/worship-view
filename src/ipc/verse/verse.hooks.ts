import { verseProjectionEnabledAtom } from '@ipc/projection/projection.atoms';
import { useAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  selectedVerseReferenceAtom,
  verseInputReferenceAtom,
  versesHistoryAtom,
} from './verse.atoms';
import bibleText from '@assets/bibles/VDC.json';
import { BibleTextType } from './verse.types';

export const useVerseControll = () => {
  const [, setVerseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const [selectedVerseReference, setSelectedVerseReference] = useAtom(
    selectedVerseReferenceAtom,
  );
  const disableVerse = useCallback(() => {
    setVerseProjectionEnabled(false);
  }, [setVerseProjectionEnabled]);

  const gotoNextVerse = useCallback(() => {
    if (!selectedVerseReference) return;
    const {
      book: bookId,
      chapter: chapterId,
      verse: verseId,
    } = selectedVerseReference;
    const bible = bibleText as BibleTextType;
    const book = bible[bookId];
    const chapter = book[chapterId - 1];

    if (chapter[verseId]) {
      setSelectedVerseReference({
        book: bookId,
        chapter: chapterId,
        verse: verseId + 1,
      });
    } else if (book[chapterId]) {
      setSelectedVerseReference({
        book: bookId,
        chapter: chapterId + 1,
        verse: 1,
      });
    }
  }, [selectedVerseReference, setSelectedVerseReference]);

  const gotoPreviousVerse = useCallback(() => {
    if (!selectedVerseReference) return;
    const {
      book: bookId,
      chapter: chapterId,
      verse: verseId,
    } = selectedVerseReference;
    const bible = bibleText as BibleTextType;
    const book = bible[bookId];
    const chapter = book[chapterId - 1];

    if (chapter[verseId - 2]) {
      setSelectedVerseReference({
        book: bookId,
        chapter: chapterId,
        verse: verseId - 1,
      });
    } else if (book[chapterId - 2]) {
      setSelectedVerseReference({
        book: bookId,
        chapter: chapterId - 1,
        verse: book[chapterId - 2].length,
      });
    }
  }, [selectedVerseReference, setSelectedVerseReference]);

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
