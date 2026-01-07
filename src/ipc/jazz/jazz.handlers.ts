import { ipcMain } from 'electron';
import { JazzChannels } from './jazz.types';

const jazzHandlers = () => {
  ipcMain.handle(JazzChannels.getApiKey, async () => {
    // Read from process.env (loaded by dotenv in main/index.ts)
    return process.env.VITE_JAZZ_API_KEY;
  });
};

export default jazzHandlers;

