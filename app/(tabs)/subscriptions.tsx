import { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import SubscriptionCard from '../../components/SubscriptionCard';
import SearchBar from '../../components/SearchBar';
import CategoryFilter from '../../components/CategoryFilter';
import { useTheme } from '../../hooks/useTheme';
import { ColorScheme } from '../../constants/colors';
import { Subscription } from '../../types/subscription';

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { subscriptions, error, fetchSubscriptions } = useSubscriptionStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'date'>('name');

  useFocusEffect(
    useCallback(() => {
      fetchSubscriptions();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  }, []);

  const filtered = useMemo(() => {
    let result = [...subscriptions];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter((s) => s.category === selectedCategory);
    }
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'date') result.sort((a, b) => a.billingDate - b.billingDate);
    return result;
  }, [subscriptions, search, selectedCategory, sortBy]);

  const handlePress = (subscription: Subscription) => {
    router.push({ pathname: '/detail', params: { id: subscription.id } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>구독 목록</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add')}>
            <Text style={styles.addButtonText}>+ 추가</Text>
          </TouchableOpacity>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="구독 검색" />
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        <View style={styles.sortRow}>
          {([['name', '이름순'], ['price', '금액순'], ['date', '결제일순']] as const).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.sortChip, sortBy === key && styles.sortChipActive]}
              onPress={() => setSortBy(key)}
            >
              <Text style={[styles.sortText, sortBy === key && styles.sortTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard subscription={item} onPress={handlePress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                {error ? error : search || selectedCategory ? '검색 결과가 없습니다' : '등록된 구독이 없습니다'}
              </Text>
              {error ? (
                <TouchableOpacity style={styles.emptyButton} onPress={fetchSubscriptions}>
                  <Text style={styles.emptyButtonText}>다시 시도</Text>
                </TouchableOpacity>
              ) : !search && !selectedCategory ? (
                <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/add')}>
                  <Text style={styles.emptyButtonText}>구독 추가하기</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sortTextActive: {
    color: '#FFFFFF',
  },
  list: {
    paddingBottom: 20,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 16,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 20,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
