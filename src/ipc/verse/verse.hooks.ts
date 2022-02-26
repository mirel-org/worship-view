import { verseProjectionEnabledAtom } from '@ipc/projection/projection.atoms';
import { useAtom } from 'jotai';
import { useCallback, useMemo } from 'react';
import {
  selectedVerseReferenceAtom,
  verseInputFocusAtom,
  verseInputValueAtom,
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

export const useVerseSearch = () => {
  const [verseInputValue] = useAtom(verseInputValueAtom);
  const [, setSelectedVerseReferenceAtom] = useAtom(selectedVerseReferenceAtom);
  const [, setVerseInputFocus] = useAtom(verseInputFocusAtom);
  const books = useMemo(() => {
    return Object.keys(bibleText);
  }, []);

  const handleSearch = useCallback(() => {
    try {
      let chunks = verseInputValue.split(' ');
      if (chunks.length === 4)
        chunks = [chunks[0] + chunks[1], chunks[2], chunks[3]];

      const book = books.find((book) => book.startsWith(chunks[0]));
      if (!book) return;

      const chapterIndex = parseInt(chunks[1], 10);
      const chapter = (bibleText as BibleTextType)[book][chapterIndex - 1];
      if (!chapter) return;

      const verseIndex = parseInt(chunks[2], 10);
      const verse = chapter[verseIndex - 1];
      if (!verse) return;

      setSelectedVerseReferenceAtom({
        book,
        chapter: chapterIndex,
        verse: verseIndex,
      });
      setVerseInputFocus(false);
    } catch (error) {
      console.log(error);
    }
  }, [
    verseInputValue,
    setSelectedVerseReferenceAtom,
    setVerseInputFocus,
    books,
  ]);
  return { handleSearch };
};
