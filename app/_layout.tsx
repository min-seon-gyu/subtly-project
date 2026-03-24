import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useCurrencyStore } from '../stores/useCurrencyStore';
import { COLORS } from '../constants/colors';

export default function RootLayout() {
  const { token, isLoading, loadToken } = useAuthStore();
  const { loadMode } = useThemeStore();
  const { loadCurrency } = useCurrencyStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadToken();
    loadMode();
    loadCurrency();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!token && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (token && inAuthGroup) {
      router.replace('/');
    }
  }, [token, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: '구독 추가', presentation: 'modal' }} />
        <Stack.Screen name="edit" options={{ title: '구독 수정' }} />
        <Stack.Screen name="detail" options={{ title: '구독 상세' }} />
      </Stack>
      <Toast />
    </>
  );
}
