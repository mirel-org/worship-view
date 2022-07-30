export type SongType = {
  id: string;
  title: string;
  content: SongContent;
  arrangement: SongArrangement;
  path: string[];
  author?: string;
  fullText: string;
};

export type ImportedSong = {
  title: string;
  path: string[];
  author?: string;
  content: SongContent;
  arrangement: SongArrangement;
};

export type SongContent = {
  [key: string]: SongPart;
};

export type SongPart = {
  title: string;
  slides: SongSlide[];
};

export type SongSlide = {
  lines: string[];
};

export type SongArrangement = string[];

export type SongPreloadType = {
  getSongs: () => Promise<ImportedSong[]>;
};

export const SongChannels = {
  getSongs: 'song.get-songs',
};
