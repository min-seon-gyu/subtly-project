import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';
import SubscriptionForm from '../components/SubscriptionForm';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { CreateSubscriptionRequest } from '../types/subscription';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

export default function EditScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { subscriptions, updateSubscription } = useSubscriptionStore();
  const [submitting, setSubmitting] = useState(false);

  const subscription = subscriptions.find((s) => s.id === id);

  if (!subscription) {
    router.back();
    return null;
  }

  const handleSubmit = async (data: CreateSubscriptionRequest) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await updateSubscription(subscription.id, data);
      router.back();
    } catch {
      // Toast는 store에서 처리
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <SubscriptionForm
          initialValues={{
            name: subscription.name,
            price: subscription.price,
            billingCycle: subscription.billingCycle,
            billingDate: subscription.billingDate,
            category: subscription.category,
            memo: subscription.memo,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="수정"
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
  },
});
