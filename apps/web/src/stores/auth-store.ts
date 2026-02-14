'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  workspace: Workspace | null;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setWorkspace: (workspace: Workspace) => void;
  logout: () => void;
  login: (data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    workspace?: Workspace;
  }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      workspace: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      setWorkspace: (workspace) => set({ workspace }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          workspace: null,
          isAuthenticated: false,
        }),

      login: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          workspace: data.workspace || null,
          isAuthenticated: true,
        }),
    }),
    {
      name: 'pixecom-auth',
    }
  )
);
