import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function SkeletonBox({ width = '100%', height = 16, borderRadius = 8, style }: Props) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius, backgroundColor: colors.border, opacity }, style]}
    />
  );
}

export function SkeletonCard() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.card}>
      <SkeletonBox width={48} height={48} borderRadius={14} />
      <View style={styles.info}>
        <SkeletonBox width="60%" height={14} />
        <SkeletonBox width="30%" height={12} style={{ marginTop: 8 }} />
      </View>
      <SkeletonBox width={60} height={14} />
    </View>
  );
}

export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
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
    gap: 14,
  },
  info: {
    flex: 1,
  },
});
