import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type Currency = 'KRW' | 'USD' | 'JPY' | 'EUR';

export interface CurrencyInfo {
  code: Currency;
  symbol: string;
  label: string;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'KRW', symbol: '₩', label: '원 (KRW)', locale: 'ko-KR' },
  { code: 'USD', symbol: '$', label: '달러 (USD)', locale: 'en-US' },
  { code: 'JPY', symbol: '¥', label: '엔 (JPY)', locale: 'ja-JP' },
  { code: 'EUR', symbol: '€', label: '유로 (EUR)', locale: 'de-DE' },
];

interface CurrencyState {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  loadCurrency: () => Promise<void>;
  formatPrice: (price: number) => string;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currency: 'KRW',

  loadCurrency: async () => {
    const saved = await SecureStore.getItemAsync('currency');
    if (saved && CURRENCIES.some((c) => c.code === saved)) {
      set({ currency: saved as Currency });
    }
  },

  setCurrency: async (currency) => {
    await SecureStore.setItemAsync('currency', currency);
    set({ currency });
  },

  formatPrice: (price: number) => {
    const info = CURRENCIES.find((c) => c.code === get().currency)!;
    if (info.code === 'KRW' || info.code === 'JPY') {
      return `${info.symbol}${Math.round(price).toLocaleString(info.locale)}`;
    }
    return `${info.symbol}${price.toLocaleString(info.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },
}));
