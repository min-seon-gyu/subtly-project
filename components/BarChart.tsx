import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { useCurrencyStore } from '../stores/useCurrencyStore';

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

export default function BarChart({ data, height = 180 }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { formatPrice } = useCurrencyStore();

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 28;
  const gap = 12;
  const svgWidth = data.length * (barWidth + gap);

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={svgWidth} height={height}>
          {data.map((d, i) => {
            const barHeight = (d.value / maxValue) * (height - 30);
            return (
              <Rect
                key={i}
                x={i * (barWidth + gap)}
                y={height - barHeight - 20}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={colors.primary}
                opacity={0.8}
              />
            );
          })}
        </Svg>
        <View style={[styles.labels, { width: svgWidth }]}>
          {data.map((d, i) => (
            <Text key={i} style={[styles.label, { width: barWidth + gap }]}>{d.label}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
  },
  labels: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
