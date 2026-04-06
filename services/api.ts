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

// PREVIEW_MODE: true = mock 데이터, false = 실제 API
const PREVIEW_MODE = false;

const mockData: Subscription[] = [
  { id: '1', name: 'Netflix', price: 17000, billingCycle: 'monthly', billingDate: 15, category: 'video', color: '#E50914', icon: 'N', currency: 'KRW', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: '2', name: 'YouTube Premium', price: 14900, billingCycle: 'monthly', billingDate: 20, category: 'video', color: '#FF0000', icon: 'YT', currency: 'KRW', isActive: true, createdAt: '2024-02-01', updatedAt: '2024-02-01' },
  { id: '3', name: 'Spotify', price: 10900, billingCycle: 'monthly', billingDate: 5, category: 'music', color: '#1DB954', icon: 'S', currency: 'KRW', isActive: true, createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: '4', name: 'ChatGPT Plus', price: 20, billingCycle: 'monthly', billingDate: 10, category: 'productivity', color: '#10A37F', icon: 'GP', currency: 'USD', isActive: true, createdAt: '2024-04-01', updatedAt: '2024-04-01' },
  { id: '5', name: 'iCloud+', price: 1100, billingCycle: 'monthly', billingDate: 25, category: 'cloud', color: '#3693F5', icon: 'iC', currency: 'KRW', isActive: true, createdAt: '2024-05-01', updatedAt: '2024-05-01' },
  { id: '6', name: 'Disney+', price: 9900, billingCycle: 'monthly', billingDate: 1, category: 'video', color: '#113CCF', icon: 'D+', currency: 'KRW', isActive: false, createdAt: '2024-06-01', updatedAt: '2024-06-01' },
];

function getMockSummary(subs: Subscription[]): SubscriptionSummary {
  const active = subs.filter((s) => s.isActive);
  const totalMonthly = active.reduce((sum, s) => sum + s.price, 0);
  const today = new Date();
  const upcomingPayments = active.map((s) => {
    let dueDate = new Date(today.getFullYear(), today.getMonth(), s.billingDate);
    if (dueDate <= today) dueDate = new Date(today.getFullYear(), today.getMonth() + 1, s.billingDate);
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { subscription: s, dueDate: dueDate.toISOString().split('T')[0], daysUntil };
  }).sort((a, b) => a.daysUntil - b.daysUntil).slice(0, 5);
  return { totalMonthly, totalYearly: totalMonthly * 12, activeCount: active.length, upcomingPayments };
}

let _mockData = [...mockData];

const mockApi = {
  async getSubscriptions(): Promise<Subscription[]> { return [..._mockData]; },
  async createSubscription(req: CreateSubscriptionRequest): Promise<Subscription> {
    const newSub: Subscription = { id: Date.now().toString(), ...req, currency: req.currency ?? 'KRW', isActive: true, isFreeTrial: req.isFreeTrial ?? false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    _mockData.push(newSub);
    return newSub;
  },
  async updateSubscription(id: string, req: UpdateSubscriptionRequest): Promise<Subscription> {
    const idx = _mockData.findIndex((s) => s.id === id);
    if (idx !== -1) _mockData[idx] = { ..._mockData[idx], ...req, updatedAt: new Date().toISOString() } as Subscription;
    return _mockData[idx];
  },
  async deleteSubscription(id: string): Promise<void> { _mockData = _mockData.filter((s) => s.id !== id); },
  async getSummary(): Promise<SubscriptionSummary> { return getMockSummary(_mockData); },
};

const realApi = {
  async getSubscriptions(): Promise<Subscription[]> {
    const res = await client.get('/api/subscriptions');
    return res.data.map(mapSubscription);
  },
  async createSubscription(req: CreateSubscriptionRequest): Promise<Subscription> {
    const res = await client.post('/api/subscriptions', { ...req, billingCycle: req.billingCycle.toUpperCase() });
    return mapSubscription(res.data);
  },
  async updateSubscription(id: string, req: UpdateSubscriptionRequest): Promise<Subscription> {
    const body: any = { ...req, billingCycle: req.billingCycle?.toUpperCase() };
    if ('pausedUntil' in req && req.pausedUntil === null) {
      body.clearPausedUntil = true;
    }
    const res = await client.put(`/api/subscriptions/${id}`, body);
    return mapSubscription(res.data);
  },
  async deleteSubscription(id: string): Promise<void> {
    await client.delete(`/api/subscriptions/${id}`);
  },
  async getSummary(): Promise<SubscriptionSummary> {
    const res = await client.get('/api/subscriptions/summary');
    const data = res.data;
    return {
      totalMonthly: data.totalMonthly, totalYearly: data.totalYearly, activeCount: data.activeCount,
      upcomingPayments: data.upcomingPayments.map((p: any) => ({ subscription: mapSubscription(p.subscription), dueDate: p.dueDate, daysUntil: p.daysUntil })),
    };
  },
};

export const api = PREVIEW_MODE ? mockApi : realApi;

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
    pausedUntil: data.pausedUntil,
    startDate: data.startDate,
    endDate: data.endDate,
    paymentMethod: data.paymentMethod,
    currency: data.currency ?? 'KRW',
    isFreeTrial: data.isFreeTrial ?? false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}
