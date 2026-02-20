import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { getApiClient } from '../../../ipc/index';
import type { DownloadedUpdateStateResult } from '@ipc/update/update.types';

type StatusMessage = {
  text: string;
  isError: boolean;
};

export const SettingsUpdate = () => {
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);
  const [downloadedState, setDownloadedState] =
    useState<DownloadedUpdateStateResult | null>(null);

  const refreshDownloadedState = async () => {
    const state = await getApiClient().getDownloadedUpdateState();
    setDownloadedState(state);
  };

  useEffect(() => {
    void refreshDownloadedState();

    const intervalId = window.setInterval(() => {
      void refreshDownloadedState();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const result = await getApiClient().checkForUpdates();
      setStatusMessage({
        text: result.message,
        isError: result.status === 'error',
      });
      if (result.status === 'error') {
        console.error(result.message);
      }
      await refreshDownloadedState();
    } finally {
      setChecking(false);
    }
  };

  const handleInstallDownloadedUpdate = async () => {
    setInstalling(true);
    try {
      const result = await getApiClient().installDownloadedUpdate();
      setStatusMessage({
        text: result.message,
        isError: result.status === 'error',
      });
      if (result.status === 'error') {
        console.error(result.message);
      }
      await refreshDownloadedState();
    } finally {
      setInstalling(false);
    }
  };

  const canInstallDownloadedUpdate = downloadedState?.status === 'downloaded';
  const hasDownloadedMetadata =
    downloadedState &&
    (downloadedState.status === 'downloaded' ||
      downloadedState.status === 'installing');

  const formattedReleaseDate = downloadedState?.releaseDate
    ? new Date(downloadedState.releaseDate).toLocaleString('ro-RO')
    : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Actualizări</h3>
      <p className="text-sm text-muted-foreground">
        Aplicația verifică automat actualizările la fiecare 10 minute.
        Poți verifica manual apăsând butonul de mai jos.
      </p>
      <Button onClick={handleCheckForUpdates} disabled={checking}>
        {checking ? 'Se verifică...' : 'Verifică actualizări'}
      </Button>
      {canInstallDownloadedUpdate && (
        <Button onClick={handleInstallDownloadedUpdate} disabled={installing}>
          {installing
            ? 'Se instalează actualizarea...'
            : 'Instalează actualizarea descărcată'}
        </Button>
      )}
      {hasDownloadedMetadata && (
        <div className="space-y-2 rounded-md border p-3">
          <p className="text-sm text-muted-foreground">
            {downloadedState.message}
          </p>
          {downloadedState.version && (
            <p className="text-sm text-muted-foreground">
              Versiune: v{downloadedState.version}
            </p>
          )}
          {downloadedState.releaseName && (
            <p className="text-sm text-muted-foreground">
              Nume release: {downloadedState.releaseName}
            </p>
          )}
          {formattedReleaseDate && (
            <p className="text-sm text-muted-foreground">
              Data release: {formattedReleaseDate}
            </p>
          )}
          {downloadedState.releaseNotes && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Note release:</p>
              <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-md bg-muted p-2 text-xs text-muted-foreground">
                {downloadedState.releaseNotes}
              </pre>
            </div>
          )}
        </div>
      )}
      {statusMessage && (
        <p
          className={`text-sm ${statusMessage.isError ? 'text-destructive' : 'text-muted-foreground'}`}
        >
          {statusMessage.text}
        </p>
      )}
    </div>
  );
};
