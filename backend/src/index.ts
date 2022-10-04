import { PrismaClient, songs } from "@prisma/client";
import { z } from "zod";
import * as trpc from "@trpc/server";
import { mapDBSongToServerSong, mapTSongToDBSong } from "./song/song.utils";
import { zSong } from "shared-types/src/song/song.zod";

const prisma = new PrismaClient();

const appRouter = trpc
  .router()
  .query("getSongs", {
    async resolve() {
      const allSongs = await prisma.songs.findMany();
      return { allSongs: allSongs.map(mapDBSongToServerSong) };
    },
  })
  .mutation("createSong", {
    input: zSong,
    async resolve(req) {
      const result = await prisma.songs.create({
        data: mapTSongToDBSong(req.input),
      });

      return { song: mapDBSongToServerSong(result) };
    },
  });

export type AppRouter = typeof appRouter;
