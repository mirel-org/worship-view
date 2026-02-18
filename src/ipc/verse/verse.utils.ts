import { BibleReferenceType } from './verse.types';

export const normalizeBibleBookName = (book: string): string =>
  book
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/^(\d+)\s*(\S.*)$/, '$1 $2');

export const formatBibleBookName = (book: string): string =>
  normalizeBibleBookName(book).toLocaleUpperCase('ro-RO');

export const formatBibleReference = (reference: BibleReferenceType): string =>
  `${formatBibleBookName(reference.book)} ${reference.chapter}:${reference.verse}`;

export const formatBibleChapterReference = (
  reference: Pick<BibleReferenceType, 'book' | 'chapter'>,
): string => `${formatBibleBookName(reference.book)} ${reference.chapter}`;
