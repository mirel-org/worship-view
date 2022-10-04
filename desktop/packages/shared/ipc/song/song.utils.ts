import { SongSlideSize } from '@ipc/settings/settings.song.types';
import {
  TClientSong,
  TSong,
  TSongSlide,
  TServerSong,
} from 'shared-types/src/song/song.types';

export const getSongSlidesBySize = (
  twoLinesSlides: TSongSlide[],
  size: SongSlideSize,
): TSongSlide[] => {
  let newSongSlides: TSongSlide[] = [];
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

export const songToText = (song: TServerSong) => {
  return (
    Object.entries(song.content)
      .map(
        ([key, part]) =>
          key +
          '\n' +
          part.slides.map((slide) => slide.lines.join('\n')).join('\n\n'),
      )
      .join('\n---\n') +
    '\n---\n' +
    song.arrangement.join(' ')
  );
};

export const parseNativeFormatSong = (
  title: string,
  data: string,
  path: string,
): TSong => {
  const chunks = data.split('\n---\n');
  const arrangement: TSong['arrangement'] = chunks.slice(-1)[0].split(' ');
  const content: TSong['content'] = Object.fromEntries(
    chunks.slice(0, -1).map((chunk) => {
      const rawSlides = chunk.split('\n');
      return [
        rawSlides[0].trim(),
        {
          title: rawSlides[0].trim(),
          slides: rawSlides
            .slice(1)
            .join('\n')
            .split('\n\n')
            .map(
              (rawSlide): TSongSlide => ({
                lines: rawSlide.split('\n').map((line) => line.trim()),
              }),
            ),
        },
      ];
    }),
  );

  return {
    title,
    content,
    arrangement,
    path: path.split('/'),
  };
};

export const getFullText = (song: TServerSong) =>
  (
    (song.title + ' ' + songToText(song))
      .toLocaleLowerCase()
      .replace(
        /[ăîșțţâş]/g,
        (charactersToReplace) =>
          ({ ă: 'a', î: 'i', ș: 's', ț: 't', â: 'a', ţ: 't', ş: 's' }[
            charactersToReplace
          ] || ''),
      )
      .match(/(\w+-\w+)|\w+/g) ?? []
  ).join(' ');

export const mapServerSongToClientSong = (
  serverSong: TServerSong,
): TClientSong => {
  return {
    ...serverSong,
    fullText: getFullText(serverSong),
  };
};
