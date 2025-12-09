export type Song = {
  id: string; // Changed from number to UUID string
  name: string;
  parts: SongPart[];
  arrangement: SongArrangement;
  fullText: string;
};

export type SongPart = {
  key: string;
  slides: SongSlide[];
};

export type SongSlide = {
  lines: string[];
};

export type SongArrangement = string[];

export type SongPreloadType = {
  getSongs: () => Promise<Song[]>;
  getSongContent: (songName: string) => Promise<string>;
  saveSong: (songName: string, content: string) => Promise<{ success: boolean }>;
  renameSong: (oldName: string, newName: string) => Promise<{ success: boolean }>;
  deleteSong: (songName: string) => Promise<{ success: boolean }>;
};

export const SongChannels = {
  getSongs: 'song.get-songs',
  getSongContent: 'song.get-song-content',
  saveSong: 'song.save-song',
  renameSong: 'song.rename-song',
  deleteSong: 'song.delete-song',
};
