import { useState, useEffect } from 'react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { useBackup } from '../../hooks/useBackup';
import { getApiClient } from '@ipc/index';
import { BackupResult, BackupInfo } from '@ipc/backup/backup.types';
import { Save, Loader2, CheckCircle2, XCircle, FolderOpen } from 'lucide-react';

export function SettingsBackup() {
  const { performBackup, lastBackupTimestamp, isBackingUp } = useBackup();
  const [backupResult, setBackupResult] = useState<BackupResult | null>(null);
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null);

  useEffect(() => {
    getApiClient()
      .getBackupInfo()
      .then(setBackupInfo)
      .catch(() => {});
  }, [lastBackupTimestamp]);

  const handleBackup = async () => {
    setBackupResult(null);
    const result = await performBackup();
    if (result) {
      setBackupResult(result);
    }
  };

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return 'Niciodată';
    return new Date(timestamp).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className='space-y-4'>
      <div className='space-y-2'>
        <Label>Backup local</Label>
        <p className='text-sm text-muted-foreground'>
          Salvează o copie locală a tuturor cântecelor ca fișiere text. Backup-ul
          se face automat la fiecare 7 zile.
        </p>
      </div>

      <div className='border rounded-lg p-4 space-y-3'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Ultimul backup</p>
            <p className='text-sm text-muted-foreground'>
              {formatDate(lastBackupTimestamp)}
            </p>
          </div>
          <Button onClick={handleBackup} disabled={isBackingUp}>
            {isBackingUp ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Se salvează...
              </>
            ) : (
              <>
                <Save className='mr-2 h-4 w-4' />
                Salvează backup
              </>
            )}
          </Button>
        </div>

        {backupInfo && (
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <FolderOpen className='h-3 w-3' />
            <span className='truncate'>{backupInfo.backupPath}</span>
          </div>
        )}
      </div>

      {backupResult && (
        <div className='border rounded-lg p-4'>
          <div className='flex items-center gap-2'>
            {backupResult.status === 'success' ? (
              <CheckCircle2 className='h-5 w-5 text-primary' />
            ) : (
              <XCircle className='h-5 w-5 text-destructive' />
            )}
            <span className='text-sm font-medium'>{backupResult.message}</span>
          </div>
          {backupResult.path && (
            <div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
              <FolderOpen className='h-3 w-3' />
              <span className='truncate'>{backupResult.path}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
