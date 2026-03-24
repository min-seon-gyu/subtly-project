import { CreateSubscriptionRequest } from '../types/subscription';

export interface SubscriptionPreset extends Omit<CreateSubscriptionRequest, 'billingDate'> {
  billingDate?: number;
}

export const PRESETS: SubscriptionPreset[] = [
  { name: 'Netflix', price: 17000, billingCycle: 'monthly', category: 'video', color: '#E50914', icon: '🎬' },
  { name: 'YouTube Premium', price: 14900, billingCycle: 'monthly', category: 'video', color: '#FF0000', icon: '▶️' },
  { name: 'Spotify', price: 10900, billingCycle: 'monthly', category: 'music', color: '#1DB954', icon: '🎵' },
  { name: 'Apple Music', price: 10900, billingCycle: 'monthly', category: 'music', color: '#FC3C44', icon: '🎶' },
  { name: 'Disney+', price: 9900, billingCycle: 'monthly', category: 'video', color: '#113CCF', icon: '🏰' },
  { name: 'ChatGPT Plus', price: 30000, billingCycle: 'monthly', category: 'productivity', color: '#10A37F', icon: '🤖' },
  { name: 'iCloud+', price: 1100, billingCycle: 'monthly', category: 'cloud', color: '#3693F5', icon: '☁️' },
  { name: 'Google One', price: 2400, billingCycle: 'monthly', category: 'cloud', color: '#4285F4', icon: '☁️' },
  { name: 'Notion', price: 10000, billingCycle: 'monthly', category: 'productivity', color: '#000000', icon: '📝' },
  { name: 'Coupang 로켓와우', price: 7890, billingCycle: 'monthly', category: 'other', color: '#E4002B', icon: '🚀' },
  { name: 'Wavve', price: 10900, billingCycle: 'monthly', category: 'video', color: '#1B1464', icon: '📺' },
  { name: 'TVING', price: 10900, billingCycle: 'monthly', category: 'video', color: '#FF0558', icon: '📺' },
];
