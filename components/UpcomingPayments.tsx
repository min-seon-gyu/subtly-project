import { View, Text, StyleSheet } from 'react-native';
import { UpcomingPayment } from '../types/subscription';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { useCurrencyStore } from '../stores/useCurrencyStore';
import dayjs from 'dayjs';

interface Props {
  payments: UpcomingPayment[];
}

export default function UpcomingPayments({ payments }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { formatPrice } = useCurrencyStore();

  if (payments.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>다가오는 결제</Text>
      {payments.map((payment) => (
        <View key={payment.subscription.id} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: payment.subscription.color }]} />
          <View style={styles.info}>
            <Text style={styles.name}>{payment.subscription.name}</Text>
            <Text style={styles.date}>
              {dayjs(payment.dueDate).format('M월 D일')}
            </Text>
          </View>
          <View style={styles.right}>
            <Text style={styles.price}>{formatPrice(payment.subscription.price, payment.subscription.currency)}</Text>
            <Text style={styles.daysUntil}>
              {payment.daysUntil === 0 ? '오늘' : `${payment.daysUntil}일 후`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  daysUntil: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
});
