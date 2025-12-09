// Google OAuth configuration - using IPC to communicate with main process
// The main process uses googleapis library which has full Node.js access

import { getApiClient } from '@ipc/index';

const api = getApiClient();

export async function getAuthUrl(): Promise<string> {
  const { authUrl } = await api.getAuthUrl();
  return authUrl;
}

export async function getTokensFromCode(code: string): Promise<{ accessToken: string; refreshToken: string }> {
  return await api.getTokensFromCode(code);
}

export async function refreshAccessToken(refreshToken: string): Promise<string> {
  return await api.refreshAccessToken(refreshToken);
}

export async function storeTokens(accessToken: string, refreshToken: string): Promise<void> {
  await api.storeTokens(accessToken, refreshToken);
}

export async function loadStoredTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
  return await api.loadStoredTokens();
}

export async function clearStoredTokens(): Promise<void> {
  await api.clearStoredTokens();
}
