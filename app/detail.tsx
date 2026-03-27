import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
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
            await deleteSubscription(subscription.id);
            router.back();
          },
        },
      ],
    );
  };

  const handleToggleActive = async () => {
    await updateSubscription(subscription.id, { isActive: !subscription.isActive });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: subscription.color + '20' }]}>
            <Text style={styles.icon}>{subscription.icon}</Text>
          </View>
          <Text style={styles.name}>{subscription.name}</Text>
          <Text style={styles.price}>{formatPrice(subscription.price)}</Text>
          <Text style={styles.cycle}>{getCycleLabel(subscription.billingCycle)}</Text>
        </View>

        <View style={styles.infoSection}>
          <InfoRow label="카테고리" value={`${category?.icon ?? ''} ${category?.label ?? subscription.category}`} colors={colors} />
          <InfoRow label="결제일" value={`매월 ${subscription.billingDate}일`} colors={colors} />
          <InfoRow label="상태" value={subscription.isActive ? '활성' : '비활성'} colors={colors} />
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
            style={[styles.actionButton, styles.toggleButton]}
            onPress={handleToggleActive}
          >
            <Text style={styles.toggleText}>
              {subscription.isActive ? '구독 일시정지' : '구독 재개'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
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
    fontSize: 36,
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
