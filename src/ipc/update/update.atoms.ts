import { atom } from 'jotai';
import { UpdateInfo } from './update.types';

export const updateInfoAtom = atom<UpdateInfo | null>(null);
export const updateErrorAtom = atom<Error | null>(null);
export const isCheckingForUpdateAtom = atom<boolean>(false);
export const isUpdateAvailableAtom = atom<boolean>(false);
export const isUpdateDownloadedAtom = atom<boolean>(false);

