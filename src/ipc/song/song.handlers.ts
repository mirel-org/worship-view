import { ProjectPaths } from '@main/constants';
import { ipcMain } from 'electron';
import { readFile, readdir, writeFile, rename, unlink } from 'fs/promises';
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

// Serialize function kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _serializeSong = (song: Song): string => {
  // Serialize parts
  const partChunks = song.parts.map((part) => {
    const slidesText = part.slides
      .map((slide) => slide.lines.join('\n'))
      .join('\n\n');
    return `${part.key}\n${slidesText}`;
  });

  // Add arrangement as the last chunk
  const arrangementText = song.arrangement.join(' ');

  // Join parts with separator and add arrangement
  return [...partChunks, arrangementText].join('\n---\n');
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

  ipcMain.handle(SongChannels.getSongContent, async (_event, songName: string) => {
    try {
      const content = await readFile(ProjectPaths.songs + songName, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read song file: ${error}`);
    }
  });

  ipcMain.handle(
    SongChannels.saveSong,
    async (_event, songName: string, content: string) => {
      try {
        await writeFile(ProjectPaths.songs + songName, content, 'utf8');
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to save song file: ${error}`);
      }
    },
  );

  ipcMain.handle(
    SongChannels.renameSong,
    async (_event, oldName: string, newName: string) => {
      try {
        const oldPath = ProjectPaths.songs + oldName;
        const newPath = ProjectPaths.songs + newName;
        await rename(oldPath, newPath);
        return { success: true };
      } catch (error) {
        throw new Error(`Failed to rename song file: ${error}`);
      }
    },
  );

  ipcMain.handle(SongChannels.deleteSong, async (_event, songName: string) => {
    try {
      await unlink(ProjectPaths.songs + songName);
      return { success: true };
    } catch (error) {
      throw new Error(`Failed to delete song file: ${error}`);
    }
  });
};

export default songHandlers;
