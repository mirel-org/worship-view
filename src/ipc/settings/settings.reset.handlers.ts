import { app, ipcMain, session } from 'electron';
import {
  SettingsResetChannels,
  SettingsResetLocalStateResult,
} from './settings.reset.types';

const resetLocalStateAndRestart =
  async (): Promise<SettingsResetLocalStateResult> => {
    try {
      const electronSession = session.defaultSession;
      await electronSession.clearStorageData({
        storages: [
          'cookies',
          'filesystem',
          'indexdb',
          'localstorage',
          'shadercache',
          'websql',
          'serviceworkers',
          'cachestorage',
        ],
      });
      await electronSession.clearCache();
      await electronSession.clearAuthCache();
      electronSession.flushStorageData();

      app.relaunch();
      setImmediate(() => {
        app.exit(0);
      });

      return {
        status: 'restarting',
        message:
          'Starea locală a fost resetată. Aplicația se va reporni automat.',
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Resetarea stării locale a eșuat: ${
          error instanceof Error ? error.message : String(error)
        }`,
      };
    }
  };

const settingsResetHandlers = () => {
  ipcMain.handle(SettingsResetChannels.resetLocalStateAndRestart, async () => {
    return resetLocalStateAndRestart();
  });
};

export default settingsResetHandlers;
