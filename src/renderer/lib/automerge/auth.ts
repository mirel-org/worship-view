import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

let oauth2Client: OAuth2Client | null = null;

export function initializeGoogleAuth(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment variables.');
  }

  oauth2Client = new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: 'urn:ietf:wg:oauth:2.0:oob', // For desktop apps
  });

  return oauth2Client;
}

export function getAuthClient(): OAuth2Client {
  if (!oauth2Client) {
    return initializeGoogleAuth();
  }
  return oauth2Client;
}

export async function getAuthUrl(): Promise<string> {
  const client = getAuthClient();
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  return authUrl;
}

export async function getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken: string }> {
  const client = getAuthClient();
  const { tokens } = await client.getToken(code);
  
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error('Failed to get tokens from authorization code');
  }

  client.setCredentials(tokens);
  
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
  };
}

export async function setCredentials(accessToken: string, refreshToken: string): Promise<void> {
  const client = getAuthClient();
  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const client = getAuthClient();
  client.setCredentials({
    refresh_token: refreshToken,
  });
  
  const { credentials } = await client.refreshAccessToken();
  
  if (!credentials.access_token) {
    throw new Error('Failed to refresh access token');
  }

  return credentials.access_token;
}

// Store tokens securely using Electron's safeStorage
export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  // In Electron, we can use safeStorage or localStorage
  // For now, using localStorage (in production, consider Electron's safeStorage)
  if (typeof window !== 'undefined') {
    localStorage.setItem('google_access_token', accessToken);
    localStorage.setItem('google_refresh_token', refreshToken);
  }
}

export async function loadStoredTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const accessToken = localStorage.getItem('google_access_token');
  const refreshToken = localStorage.getItem('google_refresh_token');

  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }

  return null;
}

export async function clearStoredTokens(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
  }
}

