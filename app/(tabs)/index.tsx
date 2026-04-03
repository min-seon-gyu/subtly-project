import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native';
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

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { summary, isLoading, error, fetchSummary } = useSubscriptionStore();
  const { nickname } = useAuthStore();
  const { monthlyBudget } = useBudgetStore();
  const { formatPrice } = useCurrencyStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  useNotification();

  useEffect(() => {
    fetchSummary();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSummary();
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

        {isLoading && !summary ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
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
          </>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>구독을 등록하고 지출을 관리해보세요</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/add')}>
              <Text style={styles.emptyButtonText}>첫 구독 추가하기</Text>
            </TouchableOpacity>
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
  loading: {
    paddingTop: 60,
    alignItems: 'center',
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
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 20,
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
