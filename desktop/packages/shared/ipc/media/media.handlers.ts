import { ProjectPaths } from '../../common/constants';
import { ipcMain } from 'electron';
import { readdir } from 'fs/promises';
import { MediaChannels, MediaItem, MediaType } from './media.types';

const getMediaType = (fileName: string): MediaType | null => {
  if (fileName.endsWith('.mp4') || fileName.endsWith('.mov')) return 'video';
  else if (
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg')
  )
    return 'image';

  return null;
};

const mediaHandlers = () => {
  ipcMain.handle(MediaChannels.getMediaItems, async () => {
    const mediaItems: MediaItem[] = [];
    const fileNames = await readdir(ProjectPaths.media);

    for (let i = 0; i < fileNames.length; i++) {
      const mediaType = getMediaType(fileNames[i]);
      if (mediaType) {
        mediaItems.push({
          id: i,
          name: fileNames[i],
          type: mediaType,
        });
      }
    }

    return mediaItems;
  });
};

export default mediaHandlers;
