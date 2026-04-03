import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { useCurrencyStore } from '../stores/useCurrencyStore';
import CountUp from './CountUp';

interface Props {
  totalMonthly: number;
  totalYearly: number;
  activeCount: number;
}

export default function MonthlyChart({ totalMonthly, totalYearly, activeCount }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { formatPrice } = useCurrencyStore();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>이번 달 구독료</Text>
      <CountUp value={totalMonthly} format={formatPrice} style={styles.totalPrice} />
      <View style={styles.subInfoRow}>
        <View style={styles.subInfo}>
          <Text style={styles.subLabel}>연간 예상</Text>
          <CountUp value={totalYearly} format={formatPrice} style={styles.subValue} />
        </View>
        <View style={styles.divider} />
        <View style={styles.subInfo}>
          <Text style={styles.subLabel}>활성 구독</Text>
          <Text style={styles.subValue}>{activeCount}개</Text>
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  totalPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 4,
  },
  subInfoRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 14,
  },
  subInfo: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  subLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  subValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
});
