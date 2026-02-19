import { BibleReferenceType } from '@ipc/verse/verse.types';

const diacriticsMap: Record<string, string> = {
  ă: 'a',
  â: 'a',
  î: 'i',
  ș: 's',
  ş: 's',
  ț: 't',
  ţ: 't',
};

export const normalizeForSearch = (input: string): string =>
  (
    input
      .toLocaleLowerCase('ro-RO')
      .replace(/[ăâîșşțţ]/g, (char) => diacriticsMap[char] || '')
      .match(/(\w+-\w+)|\w+/g) ?? []
  ).join(' ');

export const makeVerseKey = (reference: BibleReferenceType): string =>
  `${reference.book}|${reference.chapter}|${reference.verse}`;
