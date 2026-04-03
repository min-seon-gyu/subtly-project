import { CreateSubscriptionRequest } from '../types/subscription';

export interface SubscriptionPreset extends Omit<CreateSubscriptionRequest, 'billingDate'> {
  billingDate?: number;
}

export const PRESETS: SubscriptionPreset[] = [
  // 영상
  { name: 'Netflix 광고형', price: 5500, billingCycle: 'monthly', category: 'video', color: '#E50914', icon: 'N' },
  { name: 'Netflix 스탠다드', price: 13500, billingCycle: 'monthly', category: 'video', color: '#E50914', icon: 'N' },
  { name: 'Netflix 프리미엄', price: 17000, billingCycle: 'monthly', category: 'video', color: '#E50914', icon: 'N' },
  { name: 'YouTube Premium', price: 14900, billingCycle: 'monthly', category: 'video', color: '#FF0000', icon: 'YT' },
  { name: 'YouTube Premium 가족', price: 23900, billingCycle: 'monthly', category: 'video', color: '#FF0000', icon: 'YT' },
  { name: 'Disney+', price: 9900, billingCycle: 'monthly', category: 'video', color: '#113CCF', icon: 'D+' },
  { name: 'Wavve', price: 10900, billingCycle: 'monthly', category: 'video', color: '#1B1464', icon: 'W' },
  { name: 'TVING', price: 10900, billingCycle: 'monthly', category: 'video', color: '#FF0558', icon: 'TV' },
  { name: '쿠팡플레이', price: 7890, billingCycle: 'monthly', category: 'video', color: '#E4002B', icon: 'CP' },
  { name: '왓챠', price: 7900, billingCycle: 'monthly', category: 'video', color: '#FF0558', icon: 'WC' },

  // 음악
  { name: 'Spotify', price: 10900, billingCycle: 'monthly', category: 'music', color: '#1DB954', icon: 'S' },
  { name: 'Apple Music', price: 10900, billingCycle: 'monthly', category: 'music', color: '#FC3C44', icon: 'AM' },
  { name: 'Apple Music 가족', price: 16900, billingCycle: 'monthly', category: 'music', color: '#FC3C44', icon: 'AM' },
  { name: 'YouTube Music', price: 10900, billingCycle: 'monthly', category: 'music', color: '#FF0000', icon: 'YM' },
  { name: 'Melon', price: 10900, billingCycle: 'monthly', category: 'music', color: '#00CD3C', icon: 'ML' },
  { name: 'FLO', price: 10900, billingCycle: 'monthly', category: 'music', color: '#3F3FFF', icon: 'FL' },
  { name: 'Vibe', price: 10900, billingCycle: 'monthly', category: 'music', color: '#1EC800', icon: 'VB' },

  // 생산성
  { name: 'ChatGPT Plus', price: 30000, billingCycle: 'monthly', category: 'productivity', color: '#10A37F', icon: 'GP' },
  { name: 'Claude Pro', price: 30000, billingCycle: 'monthly', category: 'productivity', color: '#D97757', icon: 'CL' },
  { name: 'Notion', price: 10000, billingCycle: 'monthly', category: 'productivity', color: '#000000', icon: 'No' },
  { name: 'GitHub Copilot', price: 13000, billingCycle: 'monthly', category: 'productivity', color: '#24292E', icon: 'GH' },
  { name: 'Figma', price: 18000, billingCycle: 'monthly', category: 'productivity', color: '#F24E1E', icon: 'Fi' },
  { name: 'Adobe CC', price: 75900, billingCycle: 'monthly', category: 'productivity', color: '#FF0000', icon: 'Ad' },
  { name: 'Microsoft 365', price: 8900, billingCycle: 'monthly', category: 'productivity', color: '#0078D4', icon: 'MS' },

  // 클라우드
  { name: 'iCloud+ 50GB', price: 1100, billingCycle: 'monthly', category: 'cloud', color: '#3693F5', icon: 'iC' },
  { name: 'iCloud+ 200GB', price: 3300, billingCycle: 'monthly', category: 'cloud', color: '#3693F5', icon: 'iC' },
  { name: 'iCloud+ 2TB', price: 11000, billingCycle: 'monthly', category: 'cloud', color: '#3693F5', icon: 'iC' },
  { name: 'Google One 100GB', price: 2400, billingCycle: 'monthly', category: 'cloud', color: '#4285F4', icon: 'GO' },
  { name: 'Google One 2TB', price: 11900, billingCycle: 'monthly', category: 'cloud', color: '#4285F4', icon: 'GO' },
  { name: 'Dropbox Plus', price: 13900, billingCycle: 'monthly', category: 'cloud', color: '#0061FF', icon: 'DB' },

  // 게임
  { name: 'Xbox Game Pass', price: 10900, billingCycle: 'monthly', category: 'game', color: '#107C10', icon: 'XB' },
  { name: 'PlayStation Plus', price: 9900, billingCycle: 'monthly', category: 'game', color: '#003791', icon: 'PS' },
  { name: 'Nintendo Switch Online', price: 4900, billingCycle: 'monthly', category: 'game', color: '#E60012', icon: 'NS' },
  { name: 'Apple Arcade', price: 8900, billingCycle: 'monthly', category: 'game', color: '#0070C9', icon: 'AA' },

  // 뉴스/읽기
  { name: '밀리의서재', price: 9900, billingCycle: 'monthly', category: 'news', color: '#F5C518', icon: '밀' },
  { name: '리디셀렉트', price: 9900, billingCycle: 'monthly', category: 'news', color: '#1F8CE6', icon: '리' },
  { name: '네이버플러스 멤버십', price: 4900, billingCycle: 'monthly', category: 'news', color: '#03C75A', icon: 'N+' },
  { name: 'YES24 북클럽', price: 6500, billingCycle: 'monthly', category: 'news', color: '#1A73E8', icon: 'Y2' },

  // 건강/운동
  { name: 'Apple Fitness+', price: 12900, billingCycle: 'monthly', category: 'health', color: '#92E643', icon: 'AF' },
  { name: 'Nike Training Club', price: 6900, billingCycle: 'monthly', category: 'health', color: '#111111', icon: 'NK' },
  { name: '눔(Noom)', price: 59000, billingCycle: 'monthly', category: 'health', color: '#00A86B', icon: 'Nm' },

  // 기타
  { name: 'Coupang 로켓와우', price: 7890, billingCycle: 'monthly', category: 'other', color: '#E4002B', icon: 'CW' },
  { name: '배달의민족 클럽', price: 5990, billingCycle: 'monthly', category: 'other', color: '#2AC1BC', icon: '배' },
  { name: '카카오톡 이모티콘 플러스', price: 4900, billingCycle: 'monthly', category: 'other', color: '#FAE100', icon: 'KT' },
];
