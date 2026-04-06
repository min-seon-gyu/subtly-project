import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../stores/useAuthStore';
import { KAKAO_REDIRECT_URI } from '../constants/config';

export default function NotFoundScreen() {
  const router = useRouter();

  useEffect(() => {
    // 딥링크로 들어온 경우 처리
    Linking.getInitialURL().then(async (url) => {
      if (url && url.includes('code=')) {
        const params = new URLSearchParams(url.split('?')[1]);
        const code = params.get('code');
        if (code) {
          try {
            await useAuthStore.getState().kakaoLogin(code, KAKAO_REDIRECT_URI);
            router.replace('/');
            return;
          } catch {}
        }
      }
      // 딥링크가 아니면 홈으로
      router.replace('/');
    });
  }, []);

  return null;
}
