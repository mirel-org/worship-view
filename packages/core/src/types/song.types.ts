export type Song = {
  id: string; // Changed from number to UUID string
  name: string;
  parts: SongPart[];
  arrangement: SongArrangement;
  key?: string;
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

