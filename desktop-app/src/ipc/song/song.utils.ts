import { Song, SongCreateInput } from '@graphql/generated';
import { SongSlideSize } from '@ipc/settings/settings.song.types';
import {
  SongType,
  SongSlide,
  ImportedSong,
  SongArrangement,
  SongContent,
} from './song.types';

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

export const songToText = (song: SongType) => {
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

export const mapImportedSongs = (
  importedSongs: ImportedSong[],
): SongCreateInput[] => {
  return importedSongs.map((importedSong) => ({
    title: importedSong.title,
    arrangements: JSON.stringify(importedSong.arrangement),
    content: JSON.stringify(importedSong.content),
    path: importedSong.path.join('/'),
    author: importedSong.author,
  }));
};

export const parseSong = (
  title: string,
  data: string,
  path: string,
): ImportedSong => {
  const chunks = data.split('\n---\n');
  const arrangement: SongArrangement = chunks.slice(-1)[0].split(' ');
  const content: SongContent = Object.fromEntries(
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
              (rawSlide): SongSlide => ({
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

export const getFullText = (song: SongType) =>
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
