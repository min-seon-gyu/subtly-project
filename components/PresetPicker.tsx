import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { PRESETS, SubscriptionPreset } from '../constants/presets';
import { CATEGORIES } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

interface Props {
  onSelect: (preset: SubscriptionPreset) => void;
}

export default function PresetPicker({ onSelect }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = PRESETS.filter((p) => {
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>빠른 추가</Text>
      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder="서비스 검색 (예: 넷플릭스, Spotify)"
        placeholderTextColor={colors.textMuted}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>전체</Text>
        </TouchableOpacity>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.value}
            style={[styles.categoryChip, selectedCategory === c.value && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(selectedCategory === c.value ? null : c.value)}
          >
            <Text style={[styles.categoryText, selectedCategory === c.value && styles.categoryTextActive]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {filtered.length > 0 ? (
          filtered.map((preset, i) => (
            <TouchableOpacity
              key={i}
              style={styles.chip}
              onPress={() => onSelect(preset)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{preset.icon}</Text>
              <View style={styles.chipInfo}>
                <Text style={styles.name} numberOfLines={1}>{preset.name}</Text>
                <Text style={styles.price}>{preset.currency === 'USD' ? `$${preset.price}` : `${preset.price.toLocaleString()}원`}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
        )}
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
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  categoryRow: {
    marginBottom: 10,
    maxHeight: 36,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    minWidth: 140,
  },
  icon: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  chipInfo: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    paddingVertical: 8,
  },
});
