import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { useNotificationStore } from '../stores/useNotificationStore';
import { useBudgetStore } from '../stores/useBudgetStore';
import { useTheme } from '../hooks/useTheme';

// PREVIEW_MODE: true = 인증 우회, mock 데이터로 전체 화면 확인
const PREVIEW_MODE = false;

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const { token, isLoading, loadToken } = useAuthStore();
  const { loadMode } = useThemeStore();
  const { load: loadNotificationSettings } = useNotificationStore();
  const { load: loadBudget } = useBudgetStore();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (PREVIEW_MODE) {
      useAuthStore.setState({ token: 'preview-token', nickname: '프리뷰 유저', isLoading: false });
      setOnboardingDone(true);
    } else {
      loadToken();
      SecureStore.getItemAsync('onboardingDone').then((v) => setOnboardingDone(v === 'true'));
    }
    loadMode();
    loadNotificationSettings();
    loadBudget();
  }, []);

  useEffect(() => {
    if (PREVIEW_MODE) return;
    if (isLoading || onboardingDone === null) return;

    const inAuthGroup = segments[0] === 'auth';
    const inOnboarding = segments[0] === 'onboarding';

    if (!token && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (token && !onboardingDone && !inOnboarding) {
      router.replace('/onboarding');
    } else if (token && onboardingDone && (inAuthGroup || inOnboarding)) {
      router.replace('/');
    }
  }, [token, isLoading, segments, onboardingDone]);

  if (!PREVIEW_MODE && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="add" options={{ title: '구독 추가', presentation: 'modal' }} />
        <Stack.Screen name="edit" options={{ title: '구독 수정' }} />
        <Stack.Screen name="detail" options={{ title: '구독 상세' }} />
      </Stack>
      <Toast />
    </>
  );
}
