import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { CATEGORIES } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { Subscription } from '../types/subscription';

interface Props {
  subscriptions: Subscription[];
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function createArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

export default function CategoryPieChart({ subscriptions }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const active = subscriptions.filter((s) => s.isActive);
  const categoryTotals = CATEGORIES.map((cat, idx) => {
    const total = active
      .filter((s) => s.category === cat.value)
      .reduce((sum, s) => sum + s.price, 0);
    return { ...cat, total, color: colors.categoryColors[idx] };
  }).filter((c) => c.total > 0);

  const grandTotal = categoryTotals.reduce((sum, c) => sum + c.total, 0);
  if (grandTotal === 0) return null;

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  let currentAngle = 0;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {categoryTotals.map((cat, i) => {
            const angle = (cat.total / grandTotal) * 360;
            const path = createArc(cx, cy, r, currentAngle, currentAngle + angle);
            currentAngle += angle;
            return <Path key={i} d={path} fill={cat.color} />;
          })}
        </G>
      </Svg>
      <View style={styles.legend}>
        {categoryTotals.map((cat, i) => (
          <View key={i} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: cat.color }]} />
            <Text style={styles.legendLabel}>{cat.icon} {cat.label}</Text>
            <Text style={styles.legendValue}>
              {Math.round((cat.total / grandTotal) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  legend: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
});
