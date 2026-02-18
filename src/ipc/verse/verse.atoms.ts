import { atom } from 'jotai';
import bibleText from '@assets/bibles/VDC.json';
import { BibleReferenceType, BibleTextType } from './verse.types';

// we asume a valid value
export const selectedVerseReferenceAtom = atom<BibleReferenceType | null>(null);
export const selectedVerseTextAtom = atom<string | null>((get) => {
  const selectedVerseReference = get(selectedVerseReferenceAtom);
  if (!selectedVerseReference) return null;
  return (bibleText as BibleTextType)[selectedVerseReference.book][
    selectedVerseReference.chapter - 1
  ][selectedVerseReference.verse - 1];
});

export const verseInputReferenceAtom = atom<BibleReferenceType | null>(null);
export const verseInputValueAtom = atom<string>('');
export const verseInputFocusAtom = atom<boolean>(false);
export const versesHistoryAtom = atom<BibleReferenceType[]>([]);
