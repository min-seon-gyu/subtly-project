import { useColorScheme } from 'react-native';
import { useThemeStore } from '../stores/useThemeStore';
import { LIGHT_COLORS, DARK_COLORS, ColorScheme } from '../constants/colors';

export function useTheme(): { colors: ColorScheme; isDark: boolean } {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();

  const isDark =
    mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  return {
    colors: isDark ? DARK_COLORS : LIGHT_COLORS,
    isDark,
  };
}
