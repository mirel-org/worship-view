import { app, autoUpdater, ipcMain } from 'electron';
import { UpdateChannels, UpdateCheckResult } from './update.types';

const CHECK_TIMEOUT_MS = 10000;

const runManualUpdateCheck = (): Promise<UpdateCheckResult> => {
  if (!app.isPackaged) {
    return Promise.resolve({
      status: 'disabled',
      message:
        'Verificarea actualizărilor funcționează doar în aplicația instalată (build release).',
    });
  }

  return new Promise<UpdateCheckResult>((resolve) => {
    const updater = autoUpdater as unknown as NodeJS.EventEmitter & {
      checkForUpdates: () => void;
    };
    let settled = false;
    const timeoutId = setTimeout(() => {
      finish({
        status: 'checking',
        message:
          'Verificarea a început. Dacă există o actualizare, descărcarea continuă în fundal.',
      });
    }, CHECK_TIMEOUT_MS);

    const finish = (result: UpdateCheckResult) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      cleanup();
      resolve(result);
    };

    const onAvailable = (infoRaw?: unknown) => {
      const info = (infoRaw ?? {}) as { version?: string };
      finish({
        status: 'available',
        version: info?.version,
        message: info?.version
          ? `Actualizare disponibilă: v${info.version}. Se descarcă în fundal.`
          : 'Actualizare disponibilă. Se descarcă în fundal.',
      });
    };

    const onNotAvailable = (infoRaw?: unknown) => {
      const info = (infoRaw ?? {}) as { version?: string };
      finish({
        status: 'not-available',
        version: info?.version,
        message: info?.version
          ? `Ești la zi. Versiunea curentă: v${info.version}.`
          : 'Ești la zi. Nu există actualizări noi.',
      });
    };

    const onError = (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      finish({
        status: 'error',
        message: `Verificarea actualizărilor a eșuat: ${errorMessage}`,
      });
    };

    const cleanup = () => {
      updater.removeListener('update-available', onAvailable);
      updater.removeListener('update-not-available', onNotAvailable);
      updater.removeListener('error', onError);
    };

    updater.once('update-available', onAvailable);
    updater.once('update-not-available', onNotAvailable);
    updater.once('error', onError);

    try {
      updater.checkForUpdates();
    } catch (error) {
      onError(error);
    }
  });
};

const updateHandlers = () => {
  ipcMain.handle(UpdateChannels.checkForUpdates, async () => {
    return runManualUpdateCheck();
  });
};

export default updateHandlers;
