import Constants from 'expo-constants';
import { Platform } from 'react-native';

const extra = Constants.expoConfig?.extra;

export const API_BASE_URL =
  extra?.apiBaseUrl ??
  Platform.select({
    android: 'http://10.0.2.2:8080',
    ios: 'http://localhost:8080',
    default: 'http://localhost:8080',
  });

export const KAKAO_REST_API_KEY = extra?.kakaoRestApiKey ?? 'your-kakao-rest-api-key';
export const KAKAO_REDIRECT_URI = 'subtly://auth';
