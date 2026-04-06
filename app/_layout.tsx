import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Toast from 'react-native-toast-message';
import ErrorBoundary from '../components/ErrorBoundary';
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

    const checkAndNavigate = async () => {
      const inAuthGroup = segments[0] === 'auth';
      const inOnboarding = segments[0] === 'onboarding';

      // 온보딩 완료 여부를 매번 최신 확인
      const latestOnboarding = await SecureStore.getItemAsync('onboardingDone') === 'true';

      if (!token && !inAuthGroup) {
        router.replace('/auth/login');
      } else if (token && !latestOnboarding && !inOnboarding) {
        router.replace('/onboarding');
      } else if (token && latestOnboarding && (inAuthGroup || inOnboarding)) {
        router.replace('/');
      }
    };

    checkAndNavigate();
  }, [token, isLoading, segments]);

  if (!PREVIEW_MODE && isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
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
      <Toast
        config={{
          success: ({ text1 }) => (
            <View style={{ backgroundColor: colors.success, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginHorizontal: 20, marginTop: 10 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{text1}</Text>
            </View>
          ),
          error: ({ text1, text2 }) => (
            <View style={{ backgroundColor: colors.danger, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginHorizontal: 20, marginTop: 10 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>{text1}</Text>
              {text2 ? <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>{text2}</Text> : null}
            </View>
          ),
        }}
      />
    </ErrorBoundary>
  );
}
