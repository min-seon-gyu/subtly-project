import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { useCurrencyStore } from '../stores/useCurrencyStore';
import { Subscription } from '../types/subscription';
import dayjs from 'dayjs';

interface Props {
  subscriptions: Subscription[];
}

export default function MonthlyReport({ subscriptions }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { formatPrice } = useCurrencyStore();

  const active = subscriptions.filter((s) => s.isActive);
  const paused = subscriptions.filter((s) => !s.isActive);

  if (active.length === 0 && paused.length === 0) return null;

  const toMonthly = (s: Subscription) => {
    if (s.billingCycle === 'monthly') return s.price;
    if (s.billingCycle === 'yearly') return Math.round(s.price / 12);
    if (s.billingCycle === 'weekly') return s.price * 4;
    return s.price;
  };

  const krwActive = active.filter((s) => (s.currency ?? 'KRW') === 'KRW');
  const usdActive = active.filter((s) => s.currency === 'USD');
  const krwTotal = krwActive.reduce((sum, s) => sum + toMonthly(s), 0);
  const usdTotal = usdActive.reduce((sum, s) => sum + toMonthly(s), 0);

  const krwPaused = paused.filter((s) => (s.currency ?? 'KRW') === 'KRW');
  const usdPaused = paused.filter((s) => s.currency === 'USD');
  const krwPausedSavings = krwPaused.reduce((sum, s) => sum + toMonthly(s), 0);
  const usdPausedSavings = usdPaused.reduce((sum, s) => sum + toMonthly(s), 0);

  const mostExpensive = active.length > 0
    ? [...active].sort((a, b) => b.price - a.price)[0]
    : null;

  const endingSoon = subscriptions.filter((s) => {
    if (!s.endDate) return false;
    const daysLeft = dayjs(s.endDate).diff(dayjs(), 'day');
    return daysLeft >= 0 && daysLeft <= 30;
  });

  const insights: string[] = [];

  if (krwTotal > 0 || usdTotal > 0) {
    const parts = [];
    if (krwTotal > 0) parts.push(formatPrice(krwTotal, 'KRW'));
    if (usdTotal > 0) parts.push(formatPrice(usdTotal, 'USD'));
    insights.push(`이번 달 구독 지출은 ${parts.join(' + ')}이에요.`);
  }
  if (krwTotal > 100000) {
    insights.push(`원화 구독만 월 10만원 이상이에요. 불필요한 구독이 없는지 확인해보세요.`);
  }
  if (krwPausedSavings > 0 || usdPausedSavings > 0) {
    const parts = [];
    if (krwPausedSavings > 0) parts.push(formatPrice(krwPausedSavings, 'KRW'));
    if (usdPausedSavings > 0) parts.push(formatPrice(usdPausedSavings, 'USD'));
    insights.push(`일시정지한 구독으로 월 ${parts.join(' + ')}을 절약하고 있어요.`);
  }
  if (mostExpensive) {
    insights.push(`가장 비싼 구독은 ${mostExpensive.name} (${formatPrice(mostExpensive.price, mostExpensive.currency)})이에요.`);
  }
  if (endingSoon.length > 0) {
    insights.push(`${endingSoon.map((s) => s.name).join(', ')} 약정이 곧 종료돼요.`);
  }

  if (insights.length === 0) return null;

  const currentMonth = dayjs().format('M월');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{currentMonth} 리포트</Text>
      {insights.map((text, i) => (
        <View key={i} style={styles.insightRow}>
          <View style={styles.dot} />
          <Text style={styles.insightText}>{text}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
