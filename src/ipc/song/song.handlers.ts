import { ProjectPaths } from '@main/constants';
import { ipcMain } from 'electron';
import { readFile, readdir } from 'fs/promises';
import {
  Song,
  SongArrangement,
  SongChannels,
  SongPart,
  SongSlide,
} from './song.types';

const parseSong = (id: number, name: string, data: string): Song => {
  const chunks = data.split('\n---\n');
  const arrangement: SongArrangement = chunks.slice(-1)[0].split(' ');
  const parts: SongPart[] = chunks.slice(0, -1).map((chunk) => {
    const rawSlides = chunk.split('\n');
    return {
      key: rawSlides[0].trim(),
      slides: rawSlides
        .slice(1)
        .join('\n')
        .split('\n\n')
        .map(
          (rawSlide): SongSlide => ({
            lines: rawSlide.split('\n').map((line) => line.trim()),
          }),
        ),
    };
  });

  const fullText = (
    (name + ' ' + data)
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

  return {
    id,
    name,
    parts,
    arrangement,
    fullText,
  };
};

const songHandlers = () => {
  ipcMain.handle(SongChannels.getSongs, async () => {
    const songs: Song[] = [];
    const files = (
      await readdir(ProjectPaths.songs, { withFileTypes: true })
    ).filter((dirent) => dirent.isFile());

    const rawSongs = await Promise.all(
      files.map((dirent) => readFile(ProjectPaths.songs + dirent.name, 'utf8')),
    );

    for (let i = 0; i < files.length; i++)
      songs.push(parseSong(i, files[i].name, rawSongs[i]));

    return songs;
  });
};

export default songHandlers;
