import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_BASE_URL } from '../constants/config';

interface AuthState {
  token: string | null;
  nickname: string | null;
  isLoading: boolean;
  kakaoLogin: (code: string, redirectUri: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

async function saveTokens(accessToken: string, refreshToken: string, nickname: string) {
  await SecureStore.setItemAsync('token', accessToken);
  await SecureStore.setItemAsync('refreshToken', refreshToken);
  await SecureStore.setItemAsync('nickname', nickname);
}

async function clearTokens() {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('nickname');
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  nickname: null,
  isLoading: true,

  loadToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('token');
      const nickname = await SecureStore.getItemAsync('nickname');
      set({ token, nickname, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  kakaoLogin: async (code, redirectUri) => {
    const res = await axios.post(`${API_BASE_URL}/api/auth/kakao`, { code, redirectUri });
    const { accessToken, refreshToken, nickname } = res.data;
    await saveTokens(accessToken, refreshToken, nickname);
    set({ token: accessToken, nickname });
  },

  logout: async () => {
    await clearTokens();
    set({ token: null, nickname: null });
  },

  refreshToken: async () => {
    try {
      const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!storedRefreshToken) return false;

      const res = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken: storedRefreshToken,
      });
      const { accessToken, refreshToken, nickname } = res.data;
      await saveTokens(accessToken, refreshToken, nickname);
      set({ token: accessToken, nickname });
      return true;
    } catch {
      await clearTokens();
      set({ token: null, nickname: null });
      return false;
    }
  },
}));
