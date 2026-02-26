import { app, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { BackupChannels, BackupResult, BackupSong, BackupInfo } from './backup.types';

const MAX_BACKUPS = 10;

function getBackupsDir(): string {
  return path.join(app.getPath('documents'), 'worship-view', 'backups');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\:*?"<>|]/g, '_');
}

function getBackupFolders(backupsDir: string): string[] {
  if (!fs.existsSync(backupsDir)) return [];
  return fs
    .readdirSync(backupsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('backup-'))
    .map((d) => d.name)
    .sort();
}

const saveBackup = async (songs: BackupSong[]): Promise<BackupResult> => {
  try {
    const backupsDir = getBackupsDir();
    const today = new Date().toISOString().split('T')[0];
    const folderName = `backup-${today}`;
    const backupPath = path.join(backupsDir, folderName);

    fs.mkdirSync(backupPath, { recursive: true });

    for (const song of songs) {
      const filename = `${sanitizeFilename(song.name)}.json`;
      fs.writeFileSync(path.join(backupPath, filename), song.content, 'utf-8');
    }

    // Cleanup old backups
    const folders = getBackupFolders(backupsDir);
    if (folders.length > MAX_BACKUPS) {
      const toDelete = folders.slice(0, folders.length - MAX_BACKUPS);
      for (const folder of toDelete) {
        fs.rmSync(path.join(backupsDir, folder), { recursive: true, force: true });
      }
    }

    return {
      status: 'success',
      message: `Backup salvat cu succes: ${songs.length} cântece`,
      path: backupPath,
      songCount: songs.length,
    };
  } catch (error) {
    return {
      status: 'error',
      message: `Backup eșuat: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const getBackupInfo = async (): Promise<BackupInfo> => {
  const backupsDir = getBackupsDir();
  const folders = getBackupFolders(backupsDir);
  let lastBackupTimestamp: string | null = null;

  if (folders.length > 0) {
    const lastFolder = folders[folders.length - 1];
    const dateStr = lastFolder.replace('backup-', '');
    lastBackupTimestamp = dateStr;
  }

  return { lastBackupTimestamp, backupPath: backupsDir };
};

const backupHandlers = () => {
  ipcMain.handle(BackupChannels.saveBackup, async (_event, songs: BackupSong[]) => {
    return saveBackup(songs);
  });

  ipcMain.handle(BackupChannels.getBackupInfo, async () => {
    return getBackupInfo();
  });
};

export default backupHandlers;
