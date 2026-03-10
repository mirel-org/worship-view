import { atom } from 'jotai';
import { Song } from '../types/song.types';
import { BibleReferenceType } from '../types/verse.types';
import type { PresentationResponse } from '../jazz/presentation-store';

export type CommandPaletteResultType = 'song' | 'verse' | 'command' | 'presentation';

export type CommandAction =
  | 'create-song'
  | 'clear-service-list'
  | 'open-settings';

export type CommandPaletteResult =
  | { type: 'song'; data: Song }
  | { type: 'verse'; data: BibleReferenceType }
  | { type: 'command'; data: { id: CommandAction; label: string; description?: string } }
  | { type: 'presentation'; data: PresentationResponse };

export const commandPaletteOpenAtom = atom<boolean>(false);
export const commandPaletteSearchAtom = atom<string>('');
export const commandPaletteResultsAtom = atom<CommandPaletteResult[]>([]);

