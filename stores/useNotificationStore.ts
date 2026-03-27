import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface NotificationState {
  enabled: boolean;
  reminderDays: number;
  setEnabled: (enabled: boolean) => Promise<void>;
  setReminderDays: (days: number) => Promise<void>;
  load: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  enabled: true,
  reminderDays: 3,

  load: async () => {
    const enabled = await SecureStore.getItemAsync('notificationEnabled');
    const days = await SecureStore.getItemAsync('reminderDays');
    set({
      enabled: enabled !== 'false',
      reminderDays: days ? parseInt(days, 10) : 3,
    });
  },

  setEnabled: async (enabled) => {
    await SecureStore.setItemAsync('notificationEnabled', String(enabled));
    set({ enabled });
  },

  setReminderDays: async (days) => {
    await SecureStore.setItemAsync('reminderDays', String(days));
    set({ reminderDays: days });
  },
}));
