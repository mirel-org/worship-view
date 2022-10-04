import { z } from "zod";
import { zPart, zSlide, zSong } from "./song.zod";

export type TSong = z.infer<typeof zSong>;

export type TClientSong = TSong & {
  id: number;
  fullText: string;
};

export type TServerSong = TSong & {
  id: number;
};

export type TSongSlide = z.infer<typeof zSlide>;
export type TSongPart = z.infer<typeof zPart>;
