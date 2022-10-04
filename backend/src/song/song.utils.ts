import { songs } from "@prisma/client";
import { TServerSong, TSong } from "shared-types/src/song/song.types";

export const mapDBSongToServerSong = (dbSong: songs): TServerSong => {
  return {
    id: dbSong.id,
    title: dbSong.title,
    path: dbSong.path as TServerSong["path"],
    author: dbSong.author,
    arrangement: dbSong.arrangement as TServerSong["arrangement"],
    content: dbSong.content as TServerSong["content"],
  };
};

export const mapTSongToDBSong = (song: TSong) => {
  return {
    title: song.title,
    arrangement: JSON.stringify(song.arrangement),
    author: song.author ?? "",
    content: JSON.stringify(song.content),
    path: JSON.stringify(song.path),
  };
};
