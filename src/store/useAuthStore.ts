import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  isAgent: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  updateUser: (updatedFields) => set((state) => ({ user: state.user ? { ...state.user, ...updatedFields } : null })),
  logout: () => set({ user: null, token: null }),
}));
