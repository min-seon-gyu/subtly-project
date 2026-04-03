import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface BudgetState {
  monthlyBudget: number | null;
  setBudget: (budget: number | null) => Promise<void>;
  load: () => Promise<void>;
}

export const useBudgetStore = create<BudgetState>((set) => ({
  monthlyBudget: null,

  load: async () => {
    const saved = await SecureStore.getItemAsync('monthlyBudget');
    set({ monthlyBudget: saved ? parseInt(saved, 10) : null });
  },

  setBudget: async (budget) => {
    if (budget === null) {
      await SecureStore.deleteItemAsync('monthlyBudget');
    } else {
      await SecureStore.setItemAsync('monthlyBudget', String(budget));
    }
    set({ monthlyBudget: budget });
  },
}));
