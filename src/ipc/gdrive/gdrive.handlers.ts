import { ipcMain, safeStorage } from 'electron';
import { google } from 'googleapis';
import { GoogleDriveChannels } from './gdrive.types';

// Read environment variables lazily to ensure dotenv has loaded them
function getGoogleClientId(): string {
  return process.env.GOOGLE_CLIENT_ID || '';
}

function getGoogleClientSecret(): string {
  return process.env.GOOGLE_CLIENT_SECRET || '';
}
const REDIRECT_URI = 'urn:ietf:wg:oauth:2.0:oob'; // For desktop apps
// drive.appdata scope is required to access appDataFolder (hidden app-specific folder)
// drive.file scope allows access to files created by the app
const SCOPES = [
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.file',
];

// Token storage keys
const TOKEN_STORAGE_KEY = 'google_drive_tokens';

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    getGoogleClientId(),
    getGoogleClientSecret(),
    REDIRECT_URI
  );
}

async function storeTokensSecurely(accessToken: string, refreshToken: string): Promise<void> {
  const tokens: StoredTokens = { accessToken, refreshToken };
  
  // Use Electron's safeStorage if available (encrypted storage)
  if (safeStorage.isEncryptionAvailable()) {
    const encrypted = safeStorage.encryptString(JSON.stringify(tokens));
    // Store in app's userData directory
    const { app } = require('electron');
    const fs = require('fs');
    const path = require('path');
    const userDataPath = app.getPath('userData');
    const tokenPath = path.join(userDataPath, `${TOKEN_STORAGE_KEY}.encrypted`);
    fs.writeFileSync(tokenPath, encrypted);
  } else {
    // Fallback to unencrypted storage (less secure but works)
    const { app } = require('electron');
    const fs = require('fs');
    const path = require('path');
    const userDataPath = app.getPath('userData');
    const tokenPath = path.join(userDataPath, `${TOKEN_STORAGE_KEY}.json`);
    fs.writeFileSync(tokenPath, JSON.stringify(tokens));
  }
}

async function loadStoredTokensSecurely(): Promise<StoredTokens | null> {
  try {
    const { app } = require('electron');
    const fs = require('fs');
    const path = require('path');
    const userDataPath = app.getPath('userData');
    
    // Try encrypted storage first
    const encryptedPath = path.join(userDataPath, `${TOKEN_STORAGE_KEY}.encrypted`);
    if (fs.existsSync(encryptedPath) && safeStorage.isEncryptionAvailable()) {
      const encrypted = fs.readFileSync(encryptedPath);
      const decrypted = safeStorage.decryptString(encrypted);
      return JSON.parse(decrypted) as StoredTokens;
    }
    
    // Fallback to unencrypted storage
    const tokenPath = path.join(userDataPath, `${TOKEN_STORAGE_KEY}.json`);
    if (fs.existsSync(tokenPath)) {
      const data = fs.readFileSync(tokenPath, 'utf-8');
      return JSON.parse(data) as StoredTokens;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading stored tokens:', error);
    return null;
  }
}

async function clearStoredTokensSecurely(): Promise<void> {
  try {
    const { app } = require('electron');
    const fs = require('fs');
    const path = require('path');
    const userDataPath = app.getPath('userData');
    
    const encryptedPath = path.join(userDataPath, `${TOKEN_STORAGE_KEY}.encrypted`);
    const tokenPath = path.join(userDataPath, `${TOKEN_STORAGE_KEY}.json`);
    
    if (fs.existsSync(encryptedPath)) {
      fs.unlinkSync(encryptedPath);
    }
    if (fs.existsSync(tokenPath)) {
      fs.unlinkSync(tokenPath);
    }
  } catch (error) {
    console.error('Error clearing stored tokens:', error);
  }
}

const gdriveHandlers = () => {
  // Get OAuth authorization URL
  ipcMain.handle(GoogleDriveChannels.getAuthUrl, async () => {
    const clientId = getGoogleClientId();
    if (!clientId) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID in your environment variables.');
    }
    
    const oauth2Client = getOAuth2Client();
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force consent to get refresh token
    });
    
    return { authUrl };
  });

  // Exchange authorization code for tokens
  ipcMain.handle(GoogleDriveChannels.getTokensFromCode, async (_, code: string) => {
    const clientId = getGoogleClientId();
    const clientSecret = getGoogleClientSecret();
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.');
    }
    
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    
    if (!tokens.access_token || !tokens.refresh_token) {
      throw new Error('Failed to get access_token or refresh_token from authorization code');
    }
    
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  });

  // Refresh access token
  ipcMain.handle(GoogleDriveChannels.refreshAccessToken, async (_, refreshToken: string) => {
    const clientId = getGoogleClientId();
    const clientSecret = getGoogleClientSecret();
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth credentials not configured.');
    }
    
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    if (!credentials.access_token) {
      throw new Error('Failed to refresh access token');
    }
    
    return credentials.access_token;
  });

  // Store tokens securely
  ipcMain.handle(GoogleDriveChannels.storeTokens, async (_, accessToken: string, refreshToken: string) => {
    await storeTokensSecurely(accessToken, refreshToken);
  });

  // Load stored tokens
  ipcMain.handle(GoogleDriveChannels.loadStoredTokens, async () => {
    return await loadStoredTokensSecurely();
  });

  // Clear stored tokens
  ipcMain.handle(GoogleDriveChannels.clearStoredTokens, async () => {
    await clearStoredTokensSecurely();
  });

  // Helper function to get authenticated drive client with automatic token refresh
  async function getAuthenticatedDrive() {
    const tokens = await loadStoredTokensSecurely();
    if (!tokens) {
      throw new Error('Not authenticated with Google Drive. Please authenticate first.');
    }
    
    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
    });
    
    // Set up automatic token refresh
    oauth2Client.on('tokens', async (newTokens) => {
      if (newTokens.access_token) {
        // Update stored tokens when refreshed
        await storeTokensSecurely(
          newTokens.access_token,
          tokens.refreshToken // Keep the original refresh token
        );
      }
    });
    
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  // Find or create file in Google Drive app data folder
  ipcMain.handle(GoogleDriveChannels.findOrCreateFile, async (_, fileName: string) => {
    const drive = await getAuthenticatedDrive();
    
    // Search for existing file in appDataFolder
    const listResponse = await drive.files.list({
      q: `name='${fileName}' and trashed=false`,
      spaces: 'appDataFolder',
      fields: 'files(id, name)',
    });
    
    if (listResponse.data.files && listResponse.data.files.length > 0 && listResponse.data.files[0].id) {
      return listResponse.data.files[0].id;
    }
    
    // Create new file
    const createResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: ['appDataFolder'],
      },
      fields: 'id',
    });
    
    if (!createResponse.data.id) {
      throw new Error('Failed to create Google Drive file');
    }
    
    return createResponse.data.id;
  });

  // Load file from Google Drive
  ipcMain.handle(GoogleDriveChannels.loadFile, async (_, fileId: string) => {
    const drive = await getAuthenticatedDrive();
    
    try {
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'arraybuffer' }
      );
      
      if (response.data instanceof ArrayBuffer) {
        return new Uint8Array(response.data);
      }
      
      return null;
    } catch (error: any) {
      if (error.code === 404) {
        return null; // File doesn't exist
      }
      throw error;
    }
  });

  // Save file to Google Drive
  ipcMain.handle(GoogleDriveChannels.saveFile, async (_, fileId: string, data: Uint8Array) => {
    const drive = await getAuthenticatedDrive();
    
    await drive.files.update({
      fileId,
      media: {
        mimeType: 'application/octet-stream',
        body: Buffer.from(data),
      },
    });
  });

  // Delete file from Google Drive
  ipcMain.handle(GoogleDriveChannels.deleteFile, async (_, fileId: string) => {
    const drive = await getAuthenticatedDrive();
    
    try {
      await drive.files.delete({ fileId });
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
      // File already deleted, that's fine
    }
  });
};

export default gdriveHandlers;

