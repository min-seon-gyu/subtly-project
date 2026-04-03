import { create } from 'zustand';
import { Currency } from '../types/subscription';

interface CurrencyState {
  formatPrice: (price: number, currency?: Currency) => string;
}

export const useCurrencyStore = create<CurrencyState>(() => ({
  formatPrice: (price: number, currency: Currency = 'KRW') => {
    if (currency === 'USD') {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Math.round(price).toLocaleString('ko-KR')}원`;
  },
}));
