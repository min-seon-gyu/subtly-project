import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
    >
      <View style={[styles.iconContainer, { backgroundColor: subscription.color + '20' }]}>
        <Text style={styles.icon}>{subscription.icon}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{subscription.name}</Text>
        <Text style={styles.category}>{category?.label ?? subscription.category}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{formatPrice(subscription.price)}</Text>
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
    fontSize: 24,
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
  category: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
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
