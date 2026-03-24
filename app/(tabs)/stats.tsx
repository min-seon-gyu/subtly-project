import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import BarChart from '../../components/BarChart';
import CategoryPieChart from '../../components/CategoryPieChart';
import { COLORS } from '../../constants/colors';
import dayjs from 'dayjs';

function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export default function StatsScreen() {
  const { subscriptions, fetchSubscriptions } = useSubscriptionStore();

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [])
  );

  const active = subscriptions.filter((s) => s.isActive);

  // 최근 6개월 월별 지출 데이터 생성
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const month = dayjs().subtract(5 - i, 'month');
    const total = active.reduce((sum, s) => {
      if (s.billingCycle === 'monthly') return sum + s.price;
      if (s.billingCycle === 'yearly') return sum + Math.round(s.price / 12);
      if (s.billingCycle === 'weekly') return sum + s.price * 4;
      return sum;
    }, 0);
    return { label: month.format('M월'), value: total };
  });

  const totalMonthly = active.reduce((sum, s) => {
    if (s.billingCycle === 'monthly') return sum + s.price;
    if (s.billingCycle === 'yearly') return sum + Math.round(s.price / 12);
    if (s.billingCycle === 'weekly') return sum + s.price * 4;
    return sum;
  }, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>통계</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>월별 지출 추이</Text>
          <Text style={styles.cardSubtitle}>최근 6개월</Text>
          {monthlyData.some((d) => d.value > 0) ? (
            <BarChart data={monthlyData} />
          ) : (
            <Text style={styles.noData}>데이터가 없습니다</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>카테고리별 비율</Text>
          {active.length > 0 ? (
            <CategoryPieChart subscriptions={subscriptions} />
          ) : (
            <Text style={styles.noData}>데이터가 없습니다</Text>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>요약</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>월간 지출</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalMonthly)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>연간 예상</Text>
            <Text style={styles.summaryValue}>{formatPrice(totalMonthly * 12)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>일 평균</Text>
            <Text style={styles.summaryValue}>{formatPrice(Math.round(totalMonthly / 30))}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.summaryLabel}>활성 구독 수</Text>
            <Text style={styles.summaryValue}>{active.length}개</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  noData: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
});
