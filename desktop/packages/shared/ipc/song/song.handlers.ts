import { ProjectPaths } from '../../common/constants';
import { ipcMain } from 'electron';
import { readFile, readdir } from 'fs/promises';
import { TSong } from 'shared-types/src/song/song.types';
import { SongChannels } from './song.types';
import { parseNativeFormatSong } from './song.utils';

const songHandlers = () => {
  ipcMain.handle(SongChannels.getSongs, async () => {
    const songs: TSong[] = [];
    const files = (
      await readdir(ProjectPaths.songs, { withFileTypes: true })
    ).filter((dirent) => dirent.isFile());

    const rawSongs = await Promise.all(
      files.map((dirent) => readFile(ProjectPaths.songs + dirent.name, 'utf8')),
    );

    for (let i = 0; i < files.length; i++)
      songs.push(parseNativeFormatSong(files[i].name, rawSongs[i], ''));

    return songs;
  });
};

export default songHandlers;
