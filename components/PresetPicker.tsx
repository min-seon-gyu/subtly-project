import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { PRESETS, SubscriptionPreset } from '../constants/presets';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

interface Props {
  onSelect: (preset: SubscriptionPreset) => void;
}

export default function PresetPicker({ onSelect }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>빠른 추가</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {PRESETS.map((preset, i) => (
          <TouchableOpacity
            key={i}
            style={styles.chip}
            onPress={() => onSelect(preset)}
            activeOpacity={0.7}
          >
            <Text style={styles.icon}>{preset.icon}</Text>
            <Text style={styles.name}>{preset.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  icon: {
    fontSize: 16,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
});
