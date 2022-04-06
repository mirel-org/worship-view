import { SongSlideSize } from '@ipc/settings/settings.song.types';
import { SongSlide } from './song.types';

export const getSongSlidesBySize = (
  twoLinesSlides: SongSlide[],
  size: SongSlideSize,
): SongSlide[] => {
  let newSongSlides: SongSlide[] = [];
  switch (size) {
    case 1:
      twoLinesSlides.forEach((slide) => {
        const { lines } = slide;
        lines.forEach((line) => newSongSlides.push({ lines: [line] }));
      });
      break;
    case 2:
      newSongSlides = twoLinesSlides;
      break;
    case 4:
      for (let i = 0; i < twoLinesSlides.length; i += 2) {
        const newLines = [
          ...twoLinesSlides[i].lines,
          ...(twoLinesSlides[i + 1] ?? { lines: [] }).lines,
        ];
        newSongSlides.push({ lines: newLines });
      }
      break;
    default:
      break;
  }
  return newSongSlides;
};
