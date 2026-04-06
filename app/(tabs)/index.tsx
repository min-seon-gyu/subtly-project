import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNotification } from '../../hooks/useNotification';
import MonthlyChart from '../../components/MonthlyChart';
import UpcomingPayments from '../../components/UpcomingPayments';
import { useTheme } from '../../hooks/useTheme';
import { ColorScheme } from '../../constants/colors';
import { useBudgetStore } from '../../stores/useBudgetStore';
import { useCurrencyStore } from '../../stores/useCurrencyStore';
import MonthlyReport from '../../components/MonthlyReport';
import { SkeletonBox } from '../../components/Skeleton';
import PressableScale from '../../components/PressableScale';

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { subscriptions, summary, isLoading, error, isOffline, fetchSummary, fetchSubscriptions } = useSubscriptionStore();
  const { nickname } = useAuthStore();
  const { monthlyBudget } = useBudgetStore();
  const { formatPrice } = useCurrencyStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useNotification();

  useEffect(() => {
    fetchSummary();
    fetchSubscriptions();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchSummary(), fetchSubscriptions()]);
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <Text style={styles.greeting}>
          {nickname ? `${nickname}님, 안녕하세요` : 'Subtly'}
        </Text>
        <Text style={styles.subtitle}>은근히 새는 구독, 한눈에.</Text>

        {isOffline && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>오프라인 모드 — 마지막 저장된 데이터입니다</Text>
          </View>
        )}

        {isLoading && !summary ? (
          <View style={styles.loading}>
            <SkeletonBox width="100%" height={160} borderRadius={20} />
            <SkeletonBox width="100%" height={100} borderRadius={16} style={{ marginTop: 16 }} />
            <SkeletonBox width="100%" height={60} borderRadius={12} style={{ marginTop: 12 }} />
            <SkeletonBox width="100%" height={60} borderRadius={12} style={{ marginTop: 8 }} />
          </View>
        ) : error && !summary ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={fetchSummary}>
              <Text style={styles.emptyButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : summary ? (
          <>
            <MonthlyChart
              totalMonthly={summary.totalMonthly}
              totalYearly={summary.totalYearly}
              activeCount={summary.activeCount}
            />
            {monthlyBudget && (
              <View style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetTitle}>월 예산</Text>
                  <Text style={styles.budgetAmount}>
                    {formatPrice(summary.totalMonthly)} / {formatPrice(monthlyBudget)}
                  </Text>
                </View>
                <View style={styles.budgetBarBg}>
                  <View
                    style={[
                      styles.budgetBarFill,
                      {
                        width: `${Math.min(100, (summary.totalMonthly / monthlyBudget) * 100)}%`,
                        backgroundColor: summary.totalMonthly > monthlyBudget ? colors.danger : colors.primary,
                      },
                    ]}
                  />
                </View>
                {summary.totalMonthly > monthlyBudget && (
                  <Text style={styles.budgetOver}>
                    예산 초과 {formatPrice(summary.totalMonthly - monthlyBudget)}
                  </Text>
                )}
              </View>
            )}
            <UpcomingPayments payments={summary.upcomingPayments} />
            <MonthlyReport subscriptions={subscriptions} />
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>아직 등록된 구독이 없어요</Text>
            <Text style={styles.emptyText}>자주 사용하는 구독 서비스를 추가하면{'\n'}매달 얼마를 쓰고 있는지 확인할 수 있어요</Text>
            <PressableScale onPress={() => router.push('/add')} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>첫 구독 추가하기</Text>
            </PressableScale>
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
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  offlineBanner: {
    backgroundColor: colors.warning,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D3436',
    textAlign: 'center',
  },
  loading: {
    paddingTop: 16,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  budgetAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  budgetBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  budgetBarFill: {
    height: 8,
    borderRadius: 4,
  },
  budgetOver: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
    marginTop: 6,
    textAlign: 'right',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
