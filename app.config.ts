import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Subtly',
  slug: 'Subtly',
  scheme: 'subtly',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#6C5CE7',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.subtly.app',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#6C5CE7',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    package: 'com.subtly.app',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:8080',
    kakaoRestApiKey: process.env.KAKAO_REST_API_KEY ?? 'your-kakao-rest-api-key',
  },
});
