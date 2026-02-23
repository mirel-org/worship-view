import { ipcRenderer } from 'electron';
import { BackupChannels, BackupPreloadType } from './backup.types';

const backupPreload: BackupPreloadType = {
  saveBackup: (songs) => ipcRenderer.invoke(BackupChannels.saveBackup, songs),
  getBackupInfo: () => ipcRenderer.invoke(BackupChannels.getBackupInfo),
};

export default backupPreload;
