import { ipcMain, app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { MediaCacheChannels } from './media-cache.types';

function sanitizeId(fileStreamId: string): string {
  return fileStreamId.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getCacheDir(): string {
  return path.join(app.getPath('userData'), 'media-cache');
}

function getDataPath(fileStreamId: string): string {
  return path.join(getCacheDir(), sanitizeId(fileStreamId) + '.bin');
}

function getMetaPath(fileStreamId: string): string {
  return path.join(getCacheDir(), sanitizeId(fileStreamId) + '.json');
}

const mediaCacheHandlers = () => {
  ipcMain.handle(
    MediaCacheChannels.read,
    async (_event, fileStreamId: string) => {
      try {
        const [dataBuffer, metaBuffer] = await Promise.all([
          fs.readFile(getDataPath(fileStreamId)),
          fs.readFile(getMetaPath(fileStreamId), 'utf-8'),
        ]);
        const meta = JSON.parse(metaBuffer) as { mimeType: string };
        return {
          data: dataBuffer.buffer.slice(
            dataBuffer.byteOffset,
            dataBuffer.byteOffset + dataBuffer.byteLength,
          ),
          mimeType: meta.mimeType,
        };
      } catch {
        return null;
      }
    },
  );

  ipcMain.handle(
    MediaCacheChannels.write,
    async (_event, fileStreamId: string, data: ArrayBuffer, mimeType: string) => {
      try {
        const cacheDir = getCacheDir();
        await fs.mkdir(cacheDir, { recursive: true });
        await Promise.all([
          fs.writeFile(getDataPath(fileStreamId), Buffer.from(data)),
          fs.writeFile(
            getMetaPath(fileStreamId),
            JSON.stringify({ mimeType }),
          ),
        ]);
      } catch {
        // Cache write is best-effort — fail silently
      }
    },
  );

  ipcMain.handle(
    MediaCacheChannels.delete,
    async (_event, fileStreamId: string) => {
      try {
        await Promise.all([
          fs.unlink(getDataPath(fileStreamId)).catch(() => undefined),
          fs.unlink(getMetaPath(fileStreamId)).catch(() => undefined),
        ]);
      } catch {
        // Cache delete is best-effort — fail silently
      }
    },
  );
};

export default mediaCacheHandlers;
