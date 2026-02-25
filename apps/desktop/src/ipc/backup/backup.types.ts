export type BackupSong = {
  name: string;
  content: string;
};

export type BackupResult = {
  status: 'success' | 'error';
  message: string;
  path?: string;
  songCount?: number;
};

export type BackupInfo = {
  lastBackupTimestamp: string | null;
  backupPath: string;
};

export type BackupPreloadType = {
  saveBackup: (songs: BackupSong[]) => Promise<BackupResult>;
  getBackupInfo: () => Promise<BackupInfo>;
};

export const BackupChannels = {
  saveBackup: 'backup.save-backup',
  getBackupInfo: 'backup.get-backup-info',
};
