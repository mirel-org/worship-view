export type Song = {
  id: number;
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
};

export const SongChannels = {
  getSongs: 'song.get-songs',
};
