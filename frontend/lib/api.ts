// ============================================================
// API Client — Tulip+
// ============================================================
const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:8081';
const USER_API = process.env.NEXT_PUBLIC_USER_API_URL || 'http://localhost:8082';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  userId: number;
  email: string;
  username: string;
  role: string;
}

export interface UserProfile {
  id: number;
  userId: number;
  email: string;
  username: string;
  role: string;
  status: string;
  fullName: string | null;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  updatedAt: string;
  createdAt: string;
}

// ---------- Token storage (client only) ----------
const ACCESS_KEY  = 'tulip_access_token';
const REFRESH_KEY = 'tulip_refresh_token';
const USER_KEY    = 'tulip_user';

export const tokenStore = {
  getAccess(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_KEY);
  },
  getRefresh(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_KEY);
  },
  set(tokens: { accessToken: string; refreshToken: string }) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_KEY,  tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
  },
  setUser(u: Pick<TokenResponse, 'userId' | 'email' | 'username' | 'role'>) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  },
  getUser(): Pick<TokenResponse, 'userId' | 'email' | 'username' | 'role'> | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

// ---------- Fetch wrapper with auto refresh ----------
async function request<T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  const access = tokenStore.getAccess();
  if (access) headers['Authorization'] = `Bearer ${access}`;

  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });

  if (res.status === 401 && retry && tokenStore.getRefresh()) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return request<T>(baseUrl, path, init, false);
    }
  }

  const body: ApiResponse<T> = await res.json().catch(() => ({
    success: false,
    message: 'Invalid response',
    data: null as unknown as T,
  }));

  if (!res.ok || !body.success) {
    throw new ApiError(body.message || `HTTP ${res.status}`, body.errorCode, res.status);
  }
  return body.data;
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${AUTH_API}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const body: ApiResponse<TokenResponse> = await res.json();
    if (!res.ok || !body.success) {
      tokenStore.clear();
      return false;
    }
    tokenStore.set({
      accessToken:  body.data.accessToken,
      refreshToken: body.data.refreshToken,
    });
    tokenStore.setUser({
      userId:   body.data.userId,
      email:    body.data.email,
      username: body.data.username,
      role:     body.data.role,
    });
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

export class ApiError extends Error {
  constructor(message: string, public code?: string, public status?: number) {
    super(message);
  }
}

// ---------- Auth API ----------
export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    username: string;
    fullName?: string;
    phone?: string;
  }) =>
    request<TokenResponse>(AUTH_API, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { email: string; password: string }) =>
    request<TokenResponse>(AUTH_API, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: async () => {
    const refreshToken = tokenStore.getRefresh();
    try {
      await fetch(`${AUTH_API}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {}
    tokenStore.clear();
  },
};

// ---------- User API ----------
export const userApi = {
  me: () => request<UserProfile>(USER_API, '/api/users/me'),

  updateMe: (payload: Partial<{
    username: string;
    fullName: string;
    phone: string;
    bio: string;
    avatarUrl: string;
  }>) =>
    request<UserProfile>(USER_API, '/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  changePassword: (payload: { currentPassword: string; newPassword: string }) =>
    request<void>(USER_API, '/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
};
