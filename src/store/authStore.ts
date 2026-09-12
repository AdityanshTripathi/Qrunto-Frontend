import { create } from 'zustand';
import {
  clearInvalidSupportSession,
  teardownFrontendSession,
} from '../lib/session-lifecycle';

export interface User {
  restaurantTimezone?: string;
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'RESTAURANT_OWNER' | 'STAFF' | 'WAITER';
  supportSessionId?: string;
  restaurants: Array<{
    id: string;
    name: string;
    slug: string;
    timezone?: string;
    logoUrl?: string;
  }>;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  updateAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Load initial state from localStorage safely
  const getStoredVal = (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const getStoredUser = (): User | null => {
    try {
      const u = localStorage.getItem('qr_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  };

  const initialUser = getStoredUser();
  const initialAccessToken = getStoredVal('qr_access_token');
  const initialRefreshToken = getStoredVal('qr_refresh_token');

  try {
    clearInvalidSupportSession(localStorage, initialUser);
  } catch {
    // Storage may be unavailable in restricted browser contexts.
  }

  return {
    user: initialUser,
    accessToken: initialAccessToken,
    refreshToken: initialRefreshToken,
    isAuthenticated: !!initialAccessToken,

    setAuth: (user, accessToken, refreshToken) => {
      try {
        teardownFrontendSession(localStorage);
        localStorage.setItem('qr_user', JSON.stringify(user));
        localStorage.setItem('qr_access_token', accessToken);
        localStorage.setItem('qr_refresh_token', refreshToken);
      } catch (e) {
        console.error('Failed to save auth to localStorage', e);
      }
      set({ user, accessToken, refreshToken, isAuthenticated: true });
    },

    updateAccessToken: (accessToken) => {
      try {
        localStorage.setItem('qr_access_token', accessToken);
      } catch (e) {
        console.error('Failed to update access token in localStorage', e);
      }
      set({ accessToken, isAuthenticated: true });
    },

    clearAuth: () => {
      try {
        teardownFrontendSession(localStorage);
        localStorage.removeItem('qr_user');
        localStorage.removeItem('qr_access_token');
        localStorage.removeItem('qr_refresh_token');
      } catch (e) {
        console.error('Failed to clear localStorage', e);
      }
      set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
    },
  };
});
