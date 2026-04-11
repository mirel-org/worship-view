import { atom } from 'jotai';
import { BibleReferenceType } from '../types/verse.types';

// Local-only UI state — remains in Jotai
export const verseInputReferenceAtom = atom<BibleReferenceType | null>(null);
export const verseInputValueAtom = atom<string>('');
export const verseInputFocusAtom = atom<boolean>(false);
export const versesHistoryAtom = atom<BibleReferenceType[]>([]);
