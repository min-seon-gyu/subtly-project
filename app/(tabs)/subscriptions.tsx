import { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import SubscriptionCard from '../../components/SubscriptionCard';
import SearchBar from '../../components/SearchBar';
import CategoryFilter from '../../components/CategoryFilter';
import { COLORS } from '../../constants/colors';
import { Subscription } from '../../types/subscription';

export default function SubscriptionsScreen() {
  const { subscriptions, fetchSubscriptions } = useSubscriptionStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    let result = subscriptions;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (selectedCategory) {
      result = result.filter((s) => s.category === selectedCategory);
    }
    return result;
  }, [subscriptions, search, selectedCategory]);

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
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SubscriptionCard subscription={item} onPress={handlePress} />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{search || selectedCategory ? '🔍' : '📭'}</Text>
              <Text style={styles.emptyText}>
                {search || selectedCategory ? '검색 결과가 없습니다' : '등록된 구독이 없습니다'}
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  list: {
    paddingBottom: 20,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});
