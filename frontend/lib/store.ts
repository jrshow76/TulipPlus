import { create } from 'zustand';
import { tokenStore, TokenResponse, authApi, userApi, UserProfile } from './api';

interface AuthState {
  user: Pick<TokenResponse, 'userId' | 'email' | 'username' | 'role'> | null;
  profile: UserProfile | null;
  initialized: boolean;
  setAuth: (t: TokenResponse) => void;
  loadProfile: () => Promise<UserProfile | null>;
  hydrate: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  initialized: false,

  setAuth: (t: TokenResponse) => {
    tokenStore.set({ accessToken: t.accessToken, refreshToken: t.refreshToken });
    tokenStore.setUser({
      userId: t.userId, email: t.email, username: t.username, role: t.role,
    });
    set({
      user: { userId: t.userId, email: t.email, username: t.username, role: t.role },
    });
  },

  loadProfile: async () => {
    try {
      const profile = await userApi.me();
      set({ profile });
      return profile;
    } catch {
      return null;
    }
  },

  hydrate: () => {
    const u = tokenStore.getUser();
    set({ user: u, initialized: true });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, profile: null });
  },
}));
