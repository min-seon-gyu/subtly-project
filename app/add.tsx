import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native';
import SubscriptionForm from '../components/SubscriptionForm';
import PresetPicker from '../components/PresetPicker';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { CreateSubscriptionRequest } from '../types/subscription';
import { SubscriptionPreset } from '../constants/presets';
import { COLORS } from '../constants/colors';

export default function AddScreen() {
  const router = useRouter();
  const { addSubscription } = useSubscriptionStore();
  const [preset, setPreset] = useState<SubscriptionPreset | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: CreateSubscriptionRequest) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await addSubscription(data);
      router.back();
    } catch {
      // Toast는 store에서 처리
    } finally {
      setSubmitting(false);
    }
  };

  const handlePresetSelect = (selected: SubscriptionPreset) => {
    setPreset(selected);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <PresetPicker onSelect={handlePresetSelect} />
        <SubscriptionForm
          key={preset?.name}
          initialValues={preset ? {
            name: preset.name,
            price: preset.price,
            billingCycle: preset.billingCycle,
            category: preset.category,
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          submitLabel="추가"
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
  },
});
