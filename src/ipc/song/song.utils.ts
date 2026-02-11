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
    case 8:
      for (let i = 0; i < twoLinesSlides.length; i += 4) {
        const newLines: string[] = [];
        for (let j = 0; j < 4; j++) {
          if (twoLinesSlides[i + j]) {
            newLines.push(...twoLinesSlides[i + j].lines);
          }
        }
        newSongSlides.push({ lines: newLines });
      }
      break;
    case 'full':
      {
        const allLines: string[] = [];
        twoLinesSlides.forEach((slide) => {
          allLines.push(...slide.lines);
        });
        newSongSlides.push({ lines: allLines });
      }
      break;
    default:
      break;
  }
  return newSongSlides;
};
