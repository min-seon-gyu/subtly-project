export const LIGHT_COLORS = {
  primary: '#6C5CE7',
  primaryLight: '#A29BFE',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',
  border: '#E9ECEF',
  danger: '#E17055',
  success: '#00B894',
  warning: '#FDCB6E',
  categoryColors: [
    '#6C5CE7', '#00B894', '#E17055', '#0984E3',
    '#FDCB6E', '#E84393', '#00CEC9', '#FF7675',
  ],
} as const;

export const DARK_COLORS = {
  primary: '#A29BFE',
  primaryLight: '#6C5CE7',
  background: '#1A1A2E',
  surface: '#25253E',
  text: '#E8E8E8',
  textSecondary: '#A0A0B0',
  textMuted: '#6C6C80',
  border: '#35354A',
  danger: '#FF7675',
  success: '#55EFC4',
  warning: '#FFEAA7',
  categoryColors: [
    '#A29BFE', '#55EFC4', '#FF7675', '#74B9FF',
    '#FFEAA7', '#FD79A8', '#81ECEC', '#FAB1A0',
  ],
} as const;

// 기본 내보내기 (하위 호환성)
export const COLORS = LIGHT_COLORS;

export interface ColorScheme {
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
  categoryColors: readonly string[];
}

export const CATEGORIES = [
  { label: '영상', value: 'video', icon: 'V' },
  { label: '음악', value: 'music', icon: 'M' },
  { label: '게임', value: 'game', icon: 'G' },
  { label: '클라우드', value: 'cloud', icon: 'C' },
  { label: '생산성', value: 'productivity', icon: 'P' },
  { label: '뉴스/읽기', value: 'news', icon: 'N' },
  { label: '건강/운동', value: 'health', icon: 'H' },
  { label: '기타', value: 'other', icon: 'E' },
] as const;
