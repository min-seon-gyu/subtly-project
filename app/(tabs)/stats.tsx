import { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import BarChart from '../../components/BarChart';
import CategoryPieChart from '../../components/CategoryPieChart';
import { useTheme } from '../../hooks/useTheme';
import { ColorScheme } from '../../constants/colors';
import { useCurrencyStore } from '../../stores/useCurrencyStore';
import dayjs from 'dayjs';

export default function StatsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { formatPrice } = useCurrencyStore();
  const { subscriptions, isLoading, fetchSubscriptions } = useSubscriptionStore();

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

        {monthlyData.length >= 2 && monthlyData[monthlyData.length - 2].value > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>지난달 비교</Text>
            {(() => {
              const lastMonth = monthlyData[monthlyData.length - 2].value;
              const diff = totalMonthly - lastMonth;
              const percent = Math.round((diff / lastMonth) * 100);
              const isUp = diff > 0;
              return (
                <>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>지난달</Text>
                    <Text style={styles.summaryValue}>{formatPrice(lastMonth)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>이번달</Text>
                    <Text style={styles.summaryValue}>{formatPrice(totalMonthly)}</Text>
                  </View>
                  <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.summaryLabel}>변동</Text>
                    <Text style={[styles.summaryValue, { color: isUp ? colors.danger : colors.success }]}>
                      {isUp ? '+' : ''}{formatPrice(diff)} ({isUp ? '+' : ''}{percent}%)
                    </Text>
                  </View>
                </>
              );
            })()}
          </View>
        )}

        {active.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>비용 TOP {Math.min(5, active.length)}</Text>
            {[...active]
              .sort((a, b) => b.price - a.price)
              .slice(0, 5)
              .map((sub, i) => (
                <View key={sub.id} style={[styles.summaryRow, i === Math.min(4, active.length - 1) && { borderBottomWidth: 0 }]}>
                  <View style={styles.rankRow}>
                    <Text style={styles.rankNumber}>{i + 1}</Text>
                    <Text style={styles.summaryLabel}>{sub.name}</Text>
                  </View>
                  <Text style={styles.summaryValue}>{formatPrice(sub.price)}</Text>
                </View>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  noData: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
    width: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
});
