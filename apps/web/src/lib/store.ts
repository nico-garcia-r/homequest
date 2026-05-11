'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  displayName: string;
}

export type Locale = 'en' | 'es';

interface AuthState {
  token: string | null;
  user: User | null;
  currentHouseholdId: string | null;
  locale: Locale;
  setAuth: (token: string, user: User) => void;
  setHousehold: (id: string) => void;
  setLocale: (locale: Locale) => void;
  logout: () => void;
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      currentHouseholdId: null,
      locale: 'en',

      setAuth: (token, user) => {
        localStorage.setItem('hq_token', token);
        setCookie('hq_token', token);
        set({ token, user });
      },

      setHousehold: (id) => set({ currentHouseholdId: id }),

      setLocale: (locale) => set({ locale }),

      logout: () => {
        localStorage.removeItem('hq_token');
        deleteCookie('hq_token');
        set({ token: null, user: null, currentHouseholdId: null });
      },
    }),
    {
      name: 'homequest-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        currentHouseholdId: state.currentHouseholdId,
        locale: state.locale,
      }),
    },
  ),
);
