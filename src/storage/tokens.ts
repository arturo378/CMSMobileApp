import { Preferences } from '@capacitor/preferences';

const ACCESS_KEY = 'cms_access_token';
const REFRESH_KEY = 'cms_refresh_token';

export async function getAccessToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: ACCESS_KEY });
  return value || null;
}

export async function getRefreshToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: REFRESH_KEY });
  return value || null;
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Preferences.set({ key: ACCESS_KEY, value: accessToken });
  await Preferences.set({ key: REFRESH_KEY, value: refreshToken });
}

export async function setAccessToken(accessToken: string): Promise<void> {
  await Preferences.set({ key: ACCESS_KEY, value: accessToken });
}

export async function clearTokens(): Promise<void> {
  await Preferences.remove({ key: ACCESS_KEY });
  await Preferences.remove({ key: REFRESH_KEY });
}
