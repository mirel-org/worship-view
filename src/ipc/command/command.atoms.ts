import { atom } from 'jotai';
import { Song } from '@ipc/song/song.types';
import { BibleReferenceType } from '@ipc/verse/verse.types';

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
export const commandPaletteSelectedIndexAtom = atom<number>(0);
export const commandPaletteResultsAtom = atom<CommandPaletteResult[]>([]);

