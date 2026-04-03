import { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';
import SubscriptionCard from '../../components/SubscriptionCard';
import SearchBar from '../../components/SearchBar';
import CategoryFilter from '../../components/CategoryFilter';
import SwipeableRow from '../../components/SwipeableRow';
import AnimatedListItem from '../../components/AnimatedListItem';
import { SkeletonList } from '../../components/Skeleton';
import PressableScale from '../../components/PressableScale';
import { useTheme } from '../../hooks/useTheme';
import { ColorScheme } from '../../constants/colors';
import { Subscription } from '../../types/subscription';

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { subscriptions, isLoading, error, fetchSubscriptions, deleteSubscription } = useSubscriptionStore();
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

  const handleSwipeDelete = (subscription: Subscription) => {
    Alert.alert(
      '구독 삭제',
      `${subscription.name}을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: () => deleteSubscription(subscription.id) },
      ],
    );
  };

  return (
    <GestureHandlerRootView style={styles.safe}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>구독 목록</Text>
            <PressableScale onPress={() => router.push('/add')} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ 추가</Text>
            </PressableScale>
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
          {isLoading && subscriptions.length === 0 && !error ? (
            <SkeletonList count={5} />
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <AnimatedListItem index={index}>
                  <SwipeableRow onDelete={() => handleSwipeDelete(item)}>
                    <SubscriptionCard subscription={item} onPress={handlePress} />
                  </SwipeableRow>
                </AnimatedListItem>
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
              }
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>
                    {error ? '연결할 수 없습니다' : search || selectedCategory ? '검색 결과 없음' : '아직 구독이 없어요'}
                  </Text>
                  <Text style={styles.emptyText}>
                    {error ? error : search || selectedCategory ? '다른 키워드로 검색해보세요' : '자주 사용하는 구독 서비스를 등록해보세요'}
                  </Text>
                  {error ? (
                    <PressableScale onPress={fetchSubscriptions} style={styles.emptyButton}>
                      <Text style={styles.emptyButtonText}>다시 시도</Text>
                    </PressableScale>
                  ) : !search && !selectedCategory ? (
                    <PressableScale onPress={() => router.push('/add')} style={styles.emptyButton}>
                      <Text style={styles.emptyButtonText}>구독 추가하기</Text>
                    </PressableScale>
                  ) : null}
                </View>
              }
            />
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
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
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: 24,
  },
  emptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
