import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../storage/tokens';
import { RefreshResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export class ApiError extends Error {
  status: number;
  body: any;
  constructor(status: number, message: string, body: any) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(`${BASE_URL}/api/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    return null;
  }

  const data: RefreshResponse = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  query?: Record<string, string | number | undefined | null>;
  skipAuth?: boolean;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    });
  }
  return url.toString();
}

async function rawRequest(url: string, init: RequestInit, accessToken: string | null): Promise<Response> {
  const headers = new Headers(init.headers || {});
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  return fetch(url, { ...init, headers });
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, query, skipAuth, ...init } = options;
  const url = buildUrl(path, query);
  const fetchInit: RequestInit = {
    ...init,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let accessToken = skipAuth ? null : await getAccessToken();
  let res = await rawRequest(url, fetchInit, accessToken);

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await rawRequest(url, fetchInit, newToken);
    }
  }

  const text = await res.text();
  const parsed = text ? safeJson(text) : null;

  if (!res.ok) {
    const message = (parsed && (parsed.message || parsed.error)) || res.statusText || 'Request failed';
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
