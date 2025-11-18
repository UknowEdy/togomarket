import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authAPI } from '@/services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (phoneOrEmail: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token'),
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },

      login: async (phoneOrEmail, password) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.login({ phoneOrEmail, password });
          const { token, user } = response;

          get().setToken(token!);
          set({ user, isAuthenticated: true });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || 'Erreur de connexion');
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authAPI.register(data);
          const { token, user } = response;

          get().setToken(token!);
          set({ user, isAuthenticated: true });
        } catch (error: any) {
          throw new Error(error.response?.data?.message || "Erreur d'inscription");
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        get().setToken(null);
        set({ user: null, isAuthenticated: false });
      },

      loadUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authAPI.getMe();
          set({ user: response.user!, isAuthenticated: true });
        } catch (error) {
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
);
