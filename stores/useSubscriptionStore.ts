import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { Subscription, SubscriptionSummary, CreateSubscriptionRequest, UpdateSubscriptionRequest } from '../types/subscription';
import { api } from '../services/api';
import { schedulePaymentReminder } from '../hooks/useNotification';
import { useNotificationStore } from './useNotificationStore';

interface SubscriptionState {
  subscriptions: Subscription[];
  summary: SubscriptionSummary | null;
  isLoading: boolean;
  fetchSubscriptions: () => Promise<void>;
  fetchSummary: () => Promise<void>;
  addSubscription: (req: CreateSubscriptionRequest) => Promise<void>;
  updateSubscription: (id: string, req: UpdateSubscriptionRequest) => Promise<void>;
  deleteSubscription: (id: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  subscriptions: [],
  summary: null,
  isLoading: false,

  fetchSubscriptions: async () => {
    set({ isLoading: true });
    try {
      const subscriptions = await api.getSubscriptions();
      set({ subscriptions });
    } catch {
      Toast.show({ type: 'error', text1: '구독 목록을 불러올 수 없습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const summary = await api.getSummary();
      set({ summary });
    } catch {
      Toast.show({ type: 'error', text1: '요약 정보를 불러올 수 없습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  addSubscription: async (req) => {
    try {
      await api.createSubscription(req);
      const [subscriptions, summary] = await Promise.all([
        api.getSubscriptions(),
        api.getSummary(),
      ]);
      set({ subscriptions, summary });
      Toast.show({ type: 'success', text1: '구독이 추가되었습니다.' });
      const { enabled, reminderDays } = useNotificationStore.getState();
      if (enabled && req.billingDate) {
        schedulePaymentReminder(req.name, req.billingDate, reminderDays);
      }
    } catch {
      Toast.show({ type: 'error', text1: '구독 추가에 실패했습니다.' });
      throw new Error('addSubscription failed');
    }
  },

  updateSubscription: async (id, req) => {
    try {
      await api.updateSubscription(id, req);
      const [subscriptions, summary] = await Promise.all([
        api.getSubscriptions(),
        api.getSummary(),
      ]);
      set({ subscriptions, summary });
      Toast.show({ type: 'success', text1: '구독이 수정되었습니다.' });
      const { enabled, reminderDays } = useNotificationStore.getState();
      if (enabled && req.billingDate) {
        const sub = subscriptions.find((s) => s.id === id);
        if (sub) schedulePaymentReminder(sub.name, req.billingDate, reminderDays);
      }
    } catch {
      Toast.show({ type: 'error', text1: '구독 수정에 실패했습니다.' });
      throw new Error('updateSubscription failed');
    }
  },

  deleteSubscription: async (id) => {
    try {
      await api.deleteSubscription(id);
      const [subscriptions, summary] = await Promise.all([
        api.getSubscriptions(),
        api.getSummary(),
      ]);
      set({ subscriptions, summary });
      Toast.show({ type: 'success', text1: '구독이 삭제되었습니다.' });
    } catch {
      Toast.show({ type: 'error', text1: '구독 삭제에 실패했습니다.' });
      throw new Error('deleteSubscription failed');
    }
  },
}));
