export type BillingCycle = 'monthly' | 'yearly' | 'weekly';
export type Currency = 'KRW' | 'USD';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: BillingCycle;
  billingDate: number; // 1-31
  category: string;
  color: string;
  icon: string;
  memo?: string;
  isActive: boolean;
  pausedUntil?: string;
  startDate?: string;   // 구독 시작일
  endDate?: string;     // 약정 종료일
  paymentMethod?: string;
  currency: Currency;
  isFreeTrial?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionSummary {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
  upcomingPayments: UpcomingPayment[];
}

export interface UpcomingPayment {
  subscription: Subscription;
  dueDate: string;
  daysUntil: number;
}

export interface CreateSubscriptionRequest {
  name: string;
  price: number;
  billingCycle: BillingCycle;
  billingDate: number;
  category: string;
  color: string;
  icon: string;
  memo?: string;
  startDate?: string;
  endDate?: string;
  paymentMethod?: string;
  currency?: Currency;
  isFreeTrial?: boolean;
}

export type UpdateSubscriptionRequest = Partial<CreateSubscriptionRequest> & {
  isActive?: boolean;
  pausedUntil?: string | null;
};
