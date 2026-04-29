import { request } from './client';
import { setTokens, clearTokens, getRefreshToken } from '../storage/tokens';
import { LoginResponse, User } from './types';

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    skipAuth: true,
  });
  await setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  const refreshToken = await getRefreshToken();
  try {
    await request('/api/auth/logout', {
      method: 'POST',
      body: refreshToken ? { refreshToken } : undefined,
    });
  } catch {
    // Even if the server call fails, we still clear local tokens.
  }
  await clearTokens();
}

export async function me(): Promise<User> {
  const res = await request<{ user: User }>('/api/auth/me', { method: 'GET' });
  return res.user;
}
