import { app, autoUpdater, ipcMain } from 'electron';
import {
  UpdateChannels,
  UpdateCheckResult,
  DownloadedUpdateStateResult,
  InstallDownloadedUpdateResult,
} from './update.types';

const CHECK_TIMEOUT_MS = 10000;
let updateStateTrackingInitialized = false;
let downloadedUpdateVersion: string | undefined;
let downloadedUpdateReleaseName: string | undefined;
let downloadedUpdateReleaseDate: string | undefined;
let downloadedUpdateReleaseNotes: string | undefined;
let hasDownloadedUpdate = false;
let isInstallingUpdate = false;

const getUpdater = () =>
  autoUpdater as unknown as NodeJS.EventEmitter & {
    checkForUpdates: () => void;
    quitAndInstall: () => void;
  };

const extractVersion = (value?: string): string | undefined => {
  if (!value) return undefined;
  const versionMatch = value.match(/(\d+\.\d+\.\d+(?:[-+][A-Za-z0-9.-]+)?)/);
  return versionMatch?.[1];
};

const normalizeReleaseNotes = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value.trim() || undefined;
  if (Array.isArray(value)) {
    const textNotes = value
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && 'note' in item) {
          const note = (item as { note?: unknown }).note;
          return typeof note === 'string' ? note : '';
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
    return textNotes || undefined;
  }
  return undefined;
};

const formatReleaseDate = (value: unknown): string | undefined => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
};

const setupUpdateStateTracking = () => {
  if (updateStateTrackingInitialized || !app.isPackaged) return;
  updateStateTrackingInitialized = true;
  const updater = getUpdater();

  updater.on(
    'update-downloaded',
    (
      _event: unknown,
      releaseNotes?: unknown,
      releaseName?: unknown,
      releaseDate?: unknown
    ) => {
      const releaseNameText =
        typeof releaseName === 'string' ? releaseName : undefined;
      const releaseNotesText = normalizeReleaseNotes(releaseNotes);
      hasDownloadedUpdate = true;
      downloadedUpdateVersion =
        extractVersion(releaseNameText) || extractVersion(releaseNotesText);
      downloadedUpdateReleaseName = releaseNameText;
      downloadedUpdateReleaseDate = formatReleaseDate(releaseDate);
      downloadedUpdateReleaseNotes = releaseNotesText;
    }
  );
};

const runManualUpdateCheck = (): Promise<UpdateCheckResult> => {
  if (!app.isPackaged) {
    return Promise.resolve({
      status: 'disabled',
      message:
        'Verificarea actualizărilor funcționează doar în aplicația instalată (build release).',
    });
  }

  setupUpdateStateTracking();

  return new Promise<UpdateCheckResult>((resolve) => {
    const updater = getUpdater();
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

const getDownloadedUpdateState = (): DownloadedUpdateStateResult => {
  if (!app.isPackaged) {
    return {
      status: 'disabled',
      message:
        'Instalarea actualizărilor funcționează doar în aplicația instalată (build release).',
    };
  }

  setupUpdateStateTracking();

  if (isInstallingUpdate) {
    return {
      status: 'installing',
      version: downloadedUpdateVersion,
      releaseName: downloadedUpdateReleaseName,
      releaseDate: downloadedUpdateReleaseDate,
      releaseNotes: downloadedUpdateReleaseNotes,
      message: 'Instalarea actualizării este în curs. Aplicația se va reporni.',
    };
  }

  if (!hasDownloadedUpdate) {
    return {
      status: 'idle',
      message: 'Nu există încă o actualizare descărcată gata de instalare.',
    };
  }

  return {
    status: 'downloaded',
    version: downloadedUpdateVersion,
    releaseName: downloadedUpdateReleaseName,
    releaseDate: downloadedUpdateReleaseDate,
    releaseNotes: downloadedUpdateReleaseNotes,
    message: downloadedUpdateVersion
      ? `Actualizarea v${downloadedUpdateVersion} este descărcată și gata de instalare.`
      : 'Actualizarea este descărcată și gata de instalare.',
  };
};

const installDownloadedUpdate = (): InstallDownloadedUpdateResult => {
  if (!app.isPackaged) {
    return {
      status: 'disabled',
      message:
        'Instalarea actualizărilor funcționează doar în aplicația instalată (build release).',
    };
  }

  setupUpdateStateTracking();

  if (isInstallingUpdate) {
    return {
      status: 'installing',
      message: 'Instalarea actualizării este deja în curs.',
    };
  }

  if (!hasDownloadedUpdate) {
    return {
      status: 'not-downloaded',
      message: 'Nu există încă o actualizare descărcată pentru instalare.',
    };
  }

  try {
    isInstallingUpdate = true;
    setImmediate(() => {
      getUpdater().quitAndInstall();
    });
    return {
      status: 'installing',
      message: 'Aplicația se va închide și va instala actualizarea.',
    };
  } catch (error) {
    isInstallingUpdate = false;
    return {
      status: 'error',
      message: `Instalarea actualizării a eșuat: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

const updateHandlers = () => {
  setupUpdateStateTracking();

  ipcMain.handle(UpdateChannels.checkForUpdates, async () => {
    return runManualUpdateCheck();
  });

  ipcMain.handle(UpdateChannels.getDownloadedUpdateState, async () => {
    return getDownloadedUpdateState();
  });

  ipcMain.handle(UpdateChannels.installDownloadedUpdate, async () => {
    return installDownloadedUpdate();
  });
};

export default updateHandlers;
