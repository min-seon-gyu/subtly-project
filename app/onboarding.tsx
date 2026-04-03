import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

const STEPS = [
  {
    title: '구독을 한눈에',
    description: '넷플릭스, 유튜브, 스포티파이...\n흩어진 구독을 한 곳에서 관리하세요.',
  },
  {
    title: '지출을 파악하세요',
    description: '월별 지출 추이와 카테고리별 비율을\n차트로 한눈에 확인할 수 있습니다.',
  },
  {
    title: '결제일을 놓치지 마세요',
    description: '다가오는 결제일을 미리 알려드립니다.\n불필요한 자동 결제를 방지하세요.',
  },
];

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const router = useRouter();
  const [step, setStep] = useState(0);

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      await SecureStore.setItemAsync('onboardingDone', 'true');
      router.replace('/');
    }
  };

  const handleSkip = async () => {
    await SecureStore.setItemAsync('onboardingDone', 'true');
    router.replace('/');
  };

  const current = STEPS[step];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>건너뛰기</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.stepIndicator}>{step + 1} / {STEPS.length}</Text>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.description}>{current.description}</Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextText}>
              {step === STEPS.length - 1 ? '시작하기' : '다음'}
            </Text>
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 28,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 40,
    alignItems: 'center',
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  nextText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
