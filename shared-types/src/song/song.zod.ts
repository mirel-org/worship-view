import { z } from "zod";

export const zSlide = z.object({ lines: z.array(z.string()) });
export const zPart = z.object({
  title: z.string().min(5),
  slides: z.array(zSlide),
});

export const zSong = z.object({
  title: z.string().min(5),
  author: z.string().optional(),
  content: z.record(z.string().min(1), zPart),
  arrangement: z.array(z.string()),
  path: z.array(z.string()),
});
