import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme, CATEGORIES } from '../constants/colors';
import { useCurrencyStore } from '../stores/useCurrencyStore';
import dayjs from 'dayjs';

function getCycleLabel(cycle: string): string {
  switch (cycle) {
    case 'monthly': return '매월';
    case 'yearly': return '매년';
    case 'weekly': return '매주';
    default: return '';
  }
}

export default function DetailScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { formatPrice } = useCurrencyStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { subscriptions, deleteSubscription, updateSubscription } = useSubscriptionStore();

  const [actionLoading, setActionLoading] = useState(false);
  const subscription = subscriptions.find((s) => s.id === id);

  if (!subscription) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <Text style={styles.notFound}>구독 정보를 찾을 수 없습니다</Text>
        </View>
      </SafeAreaView>
    );
  }

  const category = CATEGORIES.find((c) => c.value === subscription.category);

  const handleDelete = () => {
    Alert.alert(
      '구독 삭제',
      `${subscription.name}을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await deleteSubscription(subscription.id);
              router.back();
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleToggleActive = async () => {
    if (subscription.isActive) {
      Alert.alert(
        '구독 일시정지',
        '일시정지 기간을 선택해주세요',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '1개월',
            onPress: () => pauseFor(1),
          },
          {
            text: '3개월',
            onPress: () => pauseFor(3),
          },
          {
            text: '기한 없이',
            onPress: async () => {
              setActionLoading(true);
              try { await updateSubscription(subscription.id, { isActive: false, pausedUntil: null }); } finally { setActionLoading(false); }
            },
          },
        ],
      );
    } else {
      setActionLoading(true);
      try { await updateSubscription(subscription.id, { isActive: true, pausedUntil: null }); } finally { setActionLoading(false); }
    }
  };

  const pauseFor = async (months: number) => {
    setActionLoading(true);
    try {
      const until = dayjs().add(months, 'month').format('YYYY-MM-DD');
      await updateSubscription(subscription.id, { isActive: false, pausedUntil: until });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: subscription.color + '20' }]}>
            <Text style={styles.icon}>{subscription.icon}</Text>
          </View>
          <Text style={styles.name}>{subscription.name}</Text>
          <Text style={styles.price}>{formatPrice(subscription.price, subscription.currency)}</Text>
          <Text style={styles.cycle}>{getCycleLabel(subscription.billingCycle)}</Text>
        </View>

        <View style={styles.infoSection}>
          <InfoRow label="카테고리" value={category?.label ?? subscription.category} colors={colors} />
          <InfoRow label="결제일" value={`매월 ${subscription.billingDate}일`} colors={colors} />
          <InfoRow
            label="상태"
            value={
              subscription.isActive
                ? '활성'
                : subscription.pausedUntil
                  ? `일시정지 (${dayjs(subscription.pausedUntil).format('M월 D일')}까지)`
                  : '일시정지'
            }
            colors={colors}
          />
          {subscription.paymentMethod && <InfoRow label="결제 수단" value={subscription.paymentMethod} colors={colors} />}
          {subscription.startDate && <InfoRow label="구독 시작일" value={dayjs(subscription.startDate).format('YYYY년 M월 D일')} colors={colors} />}
          {subscription.endDate && (() => {
            const daysLeft = dayjs(subscription.endDate).diff(dayjs(), 'day');
            const endLabel = dayjs(subscription.endDate).format('YYYY년 M월 D일');
            const badge = daysLeft < 0 ? ' (만료됨)' : daysLeft <= 7 ? ` (${daysLeft}일 남음)` : daysLeft <= 30 ? ` (${daysLeft}일 남음)` : '';
            return <InfoRow label="약정 종료일" value={`${endLabel}${badge}`} colors={colors} />;
          })()}
          <InfoRow label="등록일" value={dayjs(subscription.createdAt).format('YYYY년 M월 D일')} colors={colors} />
          {subscription.memo && <InfoRow label="메모" value={subscription.memo} colors={colors} />}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => router.push({ pathname: '/edit', params: { id: subscription.id } })}
          >
            <Text style={styles.editText}>수정</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton, actionLoading && styles.actionDisabled]}
            onPress={handleToggleActive}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator color={colors.primary} size="small" />
            ) : (
              <Text style={styles.toggleText}>
                {subscription.isActive ? '구독 일시정지' : '구독 재개'}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton, actionLoading && styles.actionDisabled]}
            onPress={handleDelete}
            disabled={actionLoading}
          >
            <Text style={styles.deleteText}>삭제</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: ColorScheme }) {
  const styles = createStyles(colors);
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  notFound: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 8,
  },
  cycle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  actionDisabled: {
    opacity: 0.5,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  editText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  toggleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger + '10',
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.danger,
  },
});
