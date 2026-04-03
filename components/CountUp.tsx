import { useEffect, useRef, useState } from 'react';
import { Text, Animated, TextStyle } from 'react-native';

interface Props {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  style?: TextStyle;
}

export default function CountUp({ value, format = String, duration = 600, style }: Props) {
  const [display, setDisplay] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animValue.setValue(0);
    const listener = animValue.addListener(({ value: v }) => {
      setDisplay(Math.round(v));
    });

    Animated.timing(animValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();

    return () => animValue.removeListener(listener);
  }, [value]);

  return <Text style={style}>{format(display)}</Text>;
}
