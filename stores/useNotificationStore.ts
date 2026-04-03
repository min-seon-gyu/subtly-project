import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface NotificationState {
  enabled: boolean;
  reminderDays: number;
  reminderHour: number;
  setEnabled: (enabled: boolean) => Promise<void>;
  setReminderDays: (days: number) => Promise<void>;
  setReminderHour: (hour: number) => Promise<void>;
  load: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  enabled: true,
  reminderDays: 3,
  reminderHour: 9,

  load: async () => {
    const enabled = await SecureStore.getItemAsync('notificationEnabled');
    const days = await SecureStore.getItemAsync('reminderDays');
    const hour = await SecureStore.getItemAsync('reminderHour');
    set({
      enabled: enabled !== 'false',
      reminderDays: days ? parseInt(days, 10) : 3,
      reminderHour: hour ? parseInt(hour, 10) : 9,
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

  setReminderHour: async (hour) => {
    await SecureStore.setItemAsync('reminderHour', String(hour));
    set({ reminderHour: hour });
  },
}));
