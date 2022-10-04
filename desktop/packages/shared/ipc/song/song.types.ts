import { TSong } from 'shared-types/src/song/song.types';

export type SongPreloadType = {
  getSongs: () => Promise<TSong[]>;
};

export const SongChannels = {
  getSongs: 'song.get-songs',
};
