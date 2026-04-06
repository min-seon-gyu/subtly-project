import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  loadMode: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',

  loadMode: async () => {
    try {
      const saved = await SecureStore.getItemAsync('themeMode');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        set({ mode: saved });
      }
    } catch {}
  },

  setMode: async (mode) => {
    try {
      await SecureStore.setItemAsync('themeMode', mode);
    } catch {}
    set({ mode });
  },
}));
