import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../../stores/useAuthStore';
import { COLORS } from '../../constants/colors';
import { KAKAO_REST_API_KEY, KAKAO_REDIRECT_URI } from '../../constants/config';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { kakaoLogin } = useAuthStore();

  const handleKakaoLogin = async () => {
    setLoading(true);
    try {
      const authUrl =
        `https://kauth.kakao.com/oauth/authorize?response_type=code` +
        `&client_id=${KAKAO_REST_API_KEY}` +
        `&redirect_uri=${encodeURIComponent(KAKAO_REDIRECT_URI)}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, KAKAO_REDIRECT_URI);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const code = parsed.queryParams?.code as string | undefined;

        if (code) {
          await kakaoLogin(code, KAKAO_REDIRECT_URI);
        } else {
          Alert.alert('로그인 실패', '카카오 인가코드를 받지 못했습니다.');
        }
      }
    } catch {
      Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>Subtly</Text>
          <Text style={styles.subtitle}>은근히 새는 구독, 한눈에.</Text>
        </View>

        <TouchableOpacity
          style={[styles.kakaoButton, loading && styles.buttonDisabled]}
          onPress={handleKakaoLogin}
          disabled={loading}
        >
          <Text style={styles.kakaoButtonText}>
            {loading ? '로그인 중...' : '카카오로 시작하기'}
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  kakaoButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191919',
  },
});
