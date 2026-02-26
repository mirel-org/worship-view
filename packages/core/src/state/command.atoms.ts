import { atom } from 'jotai';
import { Song } from '../types/song.types';
import { BibleReferenceType } from '../types/verse.types';

export type CommandPaletteResultType = 'song' | 'verse' | 'command';

export type CommandAction = 
  | 'create-song'
  | 'clear-service-list'
  | 'open-settings';

export type CommandPaletteResult = 
  | { type: 'song'; data: Song }
  | { type: 'verse'; data: BibleReferenceType }
  | { type: 'command'; data: { id: CommandAction; label: string; description?: string } };

export const commandPaletteOpenAtom = atom<boolean>(false);
export const commandPaletteSearchAtom = atom<string>('');
export const commandPaletteResultsAtom = atom<CommandPaletteResult[]>([]);

