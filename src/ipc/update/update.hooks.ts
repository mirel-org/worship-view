import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { getApiClient } from '..';
import { UpdateInfo } from './update.types';
import {
  updateInfoAtom,
  updateErrorAtom,
  isCheckingForUpdateAtom,
  isUpdateAvailableAtom,
  isUpdateDownloadedAtom,
} from './update.atoms';

export const useUpdate = () => {
  const api = getApiClient();
  const [updateInfo, setUpdateInfo] = useAtom(updateInfoAtom);
  const [error, setError] = useAtom(updateErrorAtom);
  const [isChecking, setIsChecking] = useAtom(isCheckingForUpdateAtom);
  const [isAvailable, setIsAvailable] = useAtom(isUpdateAvailableAtom);
  const [isDownloaded, setIsDownloaded] = useAtom(isUpdateDownloadedAtom);

  useEffect(() => {
    const cleanupFunctions: Array<() => void> = [];

    // Set up event listeners
    cleanupFunctions.push(
      api.onCheckingForUpdate(() => {
        setIsChecking(true);
        setError(null);
      })
    );

    cleanupFunctions.push(
      api.onUpdateAvailable((info: UpdateInfo) => {
        setUpdateInfo(info);
        setIsAvailable(true);
        setIsChecking(false);
      })
    );

    cleanupFunctions.push(
      api.onUpdateNotAvailable(() => {
        setIsChecking(false);
        setIsAvailable(false);
      })
    );

    cleanupFunctions.push(
      api.onUpdateDownloaded((info: UpdateInfo) => {
        setUpdateInfo(info);
        setIsDownloaded(true);
      })
    );

    cleanupFunctions.push(
      api.onUpdateError((err: Error) => {
        setError(err);
        setIsChecking(false);
      })
    );

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
    };
  }, [api, setUpdateInfo, setError, setIsChecking, setIsAvailable, setIsDownloaded]);

  const checkForUpdates = async () => {
    try {
      await api.checkForUpdates();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to check for updates'));
    }
  };

  const downloadUpdate = async () => {
    try {
      await api.downloadUpdate();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to download update'));
    }
  };

  const quitAndInstall = () => {
    api.quitAndInstall();
  };

  return {
    updateInfo,
    error,
    isChecking,
    isAvailable,
    isDownloaded,
    checkForUpdates,
    downloadUpdate,
    quitAndInstall,
  };
};

