import { ProjectPaths } from '@main/constants';
import { ipcMain } from 'electron';
import { readFile, readdir } from 'fs/promises';
import { ImportedSong, SongChannels } from './song.types';
import { parseSong } from './song.utils';

const songHandlers = () => {
  ipcMain.handle(SongChannels.getSongs, async () => {
    const songs: ImportedSong[] = [];
    const files = (
      await readdir(ProjectPaths.songs, { withFileTypes: true })
    ).filter((dirent) => dirent.isFile());

    const rawSongs = await Promise.all(
      files.map((dirent) => readFile(ProjectPaths.songs + dirent.name, 'utf8')),
    );

    for (let i = 0; i < files.length; i++)
      songs.push(parseSong(files[i].name, rawSongs[i], ''));

    return songs;
  });
};

export default songHandlers;
