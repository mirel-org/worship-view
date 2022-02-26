import { app } from "electron";

const root = app.getPath("documents") + "/worship-view/";

export const ProjectPaths = {
  root,
  media: root + "media/",
  songs: root + "songs/",
};