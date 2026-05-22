import { create } from 'zustand';

export interface IUserProfile {
  id: string;
  email: string;
  firstName: string;
  role: 'Admin' | 'Manager' | 'Supervisor' | 'Worker';
}

interface IAuthState {
  user: IUserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setSession: (user: IUserProfile, access: string, refresh: string) => void;
  clearSession: () => void;
  loadSession: () => void;
}

export const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setSession: (user, access, refresh) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);
    }
    set({ user, accessToken: access, refreshToken: refresh, isAuthenticated: true });
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  loadSession: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      const access = localStorage.getItem('accessToken');
      const refresh = localStorage.getItem('refreshToken');

      if (userStr && access && refresh) {
        set({
          user: JSON.parse(userStr),
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        });
      }
    }
  },
}));
