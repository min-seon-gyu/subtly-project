import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Subtly',
  slug: 'subtly',
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
    buildNumber: '1',
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: false,
      },
    },
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#6C5CE7',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    package: 'com.subtly.app',
    versionCode: 1,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-web-browser',
    '@react-native-community/datetimepicker',
  ],
  extra: {
    apiBaseUrl: process.env.API_BASE_URL ?? 'http://localhost:8080',
    kakaoRestApiKey: process.env.KAKAO_REST_API_KEY ?? '',
    eas: {
      projectId: '38059196-2887-4a86-aefc-28abcc962915',
    },
  },
  owner: 'seongyumin',
});
