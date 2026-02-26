import { useState, useCallback, useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { lastBackupTimestampAtom } from './backup.atoms';
import { getApiClient } from '../index';
import { useActiveOrganization, reconstructRawText } from '@worship-view/core';
import { getSongsArray } from '@worship-view/schema';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const AUTO_BACKUP_DELAY_MS = 5000;

export function useBackup() {
  const { activeOrganization } = useActiveOrganization();
  const [lastBackupTimestamp, setLastBackupTimestamp] = useAtom(lastBackupTimestampAtom);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const performBackup = useCallback(async () => {
    if (!activeOrganization || isBackingUp) return null;

    setIsBackingUp(true);
    try {
      const songs = getSongsArray(activeOrganization);
      const backupSongs = songs
        .filter((song) => song !== null)
        .map((song) => ({
          name: song.name,
          content: reconstructRawText(song),
        }));

      if (backupSongs.length === 0) {
        return { status: 'error' as const, message: 'Nu există cântece de salvat' };
      }

      const result = await getApiClient().saveBackup(backupSongs);
      if (result.status === 'success') {
        setLastBackupTimestamp(new Date().toISOString());
      }
      return result;
    } catch (error) {
      return {
        status: 'error' as const,
        message: `Backup eșuat: ${error instanceof Error ? error.message : String(error)}`,
      };
    } finally {
      setIsBackingUp(false);
    }
  }, [activeOrganization, isBackingUp, setLastBackupTimestamp]);

  return { performBackup, lastBackupTimestamp, isBackingUp };
}

export function useAutoBackup() {
  const { activeOrganization } = useActiveOrganization();
  const [lastBackupTimestamp] = useAtom(lastBackupTimestampAtom);
  const { performBackup } = useBackup();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    if (!activeOrganization) return;

    const isDue =
      !lastBackupTimestamp ||
      Date.now() - new Date(lastBackupTimestamp).getTime() > SEVEN_DAYS_MS;

    if (!isDue) {
      hasRun.current = true;
      return;
    }

    const timer = setTimeout(() => {
      hasRun.current = true;
      performBackup();
    }, AUTO_BACKUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [activeOrganization, lastBackupTimestamp, performBackup]);
}
