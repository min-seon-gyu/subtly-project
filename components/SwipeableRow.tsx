import { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

interface Props {
  onDelete: () => void;
  children: React.ReactNode;
}

export default function SwipeableRow({ onDelete, children }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const swipeableRef = useRef<Swipeable>(null);

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    swipeableRef.current?.close();
    onDelete();
  };

  const renderRightActions = (_progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0.5],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.deleteContainer}>
        <Animated.View style={[styles.deleteButton, { transform: [{ scale }] }]}>
          <Text style={styles.deleteText} onPress={handleDelete}>삭제</Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      {children}
    </Swipeable>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  deleteContainer: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: colors.danger,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    width: 72,
    height: '100%',
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
