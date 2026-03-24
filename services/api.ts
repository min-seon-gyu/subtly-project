import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import {
  Subscription,
  SubscriptionSummary,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
} from '../types/subscription';
import { API_BASE_URL } from '../constants/config';

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      const { useAuthStore } = require('../stores/useAuthStore');
      const success = await useAuthStore.getState().refreshToken();
      isRefreshing = false;

      if (success) {
        const newToken = await SecureStore.getItemAsync('token');
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      }

      Toast.show({ type: 'error', text1: '세션 만료', text2: '다시 로그인해주세요.' });
    } else if (error.response?.status === 400) {
      const message = error.response?.data?.message ?? '요청을 확인해주세요.';
      Toast.show({ type: 'error', text1: '요청 오류', text2: message });
    } else if (!error.response) {
      Toast.show({ type: 'error', text1: '네트워크 오류', text2: '서버에 연결할 수 없습니다.' });
    }
    return Promise.reject(error);
  }
);

export const api = {
  async getSubscriptions(): Promise<Subscription[]> {
    const res = await client.get('/api/subscriptions');
    return res.data.map(mapSubscription);
  },

  async createSubscription(req: CreateSubscriptionRequest): Promise<Subscription> {
    const res = await client.post('/api/subscriptions', {
      ...req,
      billingCycle: req.billingCycle.toUpperCase(),
    });
    return mapSubscription(res.data);
  },

  async updateSubscription(id: string, req: UpdateSubscriptionRequest): Promise<Subscription> {
    const res = await client.put(`/api/subscriptions/${id}`, {
      ...req,
      billingCycle: req.billingCycle?.toUpperCase(),
    });
    return mapSubscription(res.data);
  },

  async deleteSubscription(id: string): Promise<void> {
    await client.delete(`/api/subscriptions/${id}`);
  },

  async getSummary(): Promise<SubscriptionSummary> {
    const res = await client.get('/api/subscriptions/summary');
    const data = res.data;
    return {
      totalMonthly: data.totalMonthly,
      totalYearly: data.totalYearly,
      activeCount: data.activeCount,
      upcomingPayments: data.upcomingPayments.map((p: any) => ({
        subscription: mapSubscription(p.subscription),
        dueDate: p.dueDate,
        daysUntil: p.daysUntil,
      })),
    };
  },
};

function mapSubscription(data: any): Subscription {
  return {
    id: data.id.toString(),
    name: data.name,
    price: data.price,
    billingCycle: data.billingCycle.toLowerCase(),
    billingDate: data.billingDate,
    category: data.category,
    color: data.color,
    icon: data.icon,
    memo: data.memo,
    isActive: data.isActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
