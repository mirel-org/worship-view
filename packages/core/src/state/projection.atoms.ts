import { atom } from 'jotai';
import { ProjectionType } from '../types/projection.types';

export const currentProjectionTypeAtom = atom<ProjectionType>('none');
export const verseProjectionEnabledAtom = atom<boolean>(false);
