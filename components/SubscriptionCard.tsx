import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { Subscription } from '../types/subscription';
import { CATEGORIES } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { useCurrencyStore } from '../stores/useCurrencyStore';

interface Props {
  subscription: Subscription;
  onPress: (subscription: Subscription) => void;
}

function getCycleLabel(cycle: string): string {
  switch (cycle) {
    case 'monthly': return '/월';
    case 'yearly': return '/년';
    case 'weekly': return '/주';
    default: return '';
  }
}

export default function SubscriptionCard({ subscription, onPress }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { formatPrice } = useCurrencyStore();

  const category = CATEGORIES.find((c) => c.value === subscription.category);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(subscription)}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${subscription.name}, ${getCycleLabel(subscription.billingCycle)} ${formatPrice(subscription.price, subscription.currency)}`}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: subscription.color + '20' }]}>
        <Text style={styles.icon}>{subscription.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{subscription.name}</Text>
        <View style={styles.categoryRow}>
          <Text style={styles.category}>{category?.label ?? subscription.category}</Text>
          {subscription.endDate && dayjs(subscription.endDate).diff(dayjs(), 'day') <= 7 && dayjs(subscription.endDate).diff(dayjs(), 'day') >= 0 && (
            <View style={styles.endBadge}>
              <Text style={styles.endBadgeText}>{dayjs(subscription.endDate).diff(dayjs(), 'day')}일 남음</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(subscription.price, subscription.currency)}</Text>
        <Text style={styles.cycle}>{getCycleLabel(subscription.billingCycle)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  info: {
    flex: 1,
    marginLeft: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  category: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  endBadge: {
    backgroundColor: colors.warning,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  endBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2D3436',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  cycle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
