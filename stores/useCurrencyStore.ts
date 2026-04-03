import { create } from 'zustand';

interface CurrencyState {
  formatPrice: (price: number) => string;
}

export const useCurrencyStore = create<CurrencyState>(() => ({
  formatPrice: (price: number) => {
    return `${Math.round(price).toLocaleString('ko-KR')}원`;
  },
}));
