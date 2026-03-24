import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useState } from 'react';
import { COLORS } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useCurrencyStore, CURRENCIES } from '../../stores/useCurrencyStore';

const THEME_OPTIONS = [
  { label: '시스템', value: 'system' as const },
  { label: '라이트', value: 'light' as const },
  { label: '다크', value: 'dark' as const },
];

export default function SettingsScreen() {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);
  const { nickname, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const { currency, setCurrency } = useCurrencyStore();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>설정</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>알림</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>결제일 알림</Text>
              <Text style={styles.rowSub}>결제일 전 미리 알려드립니다</Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={setNotificationEnabled}
              trackColor={{ true: COLORS.primary }}
            />
          </View>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>사전 알림 일수</Text>
              <Text style={styles.rowSub}>결제일 {reminderDays}일 전 알림</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setReminderDays(Math.max(1, reminderDays - 1))}
              >
                <Text style={styles.stepperText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{reminderDays}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setReminderDays(Math.min(7, reminderDays + 1))}
              >
                <Text style={styles.stepperText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>테마</Text>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.themeButton, mode === opt.value && styles.themeButtonActive]}
                onPress={() => setMode(opt.value)}
              >
                <Text style={[styles.themeText, mode === opt.value && styles.themeTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>통화</Text>
          <View style={styles.themeRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[styles.themeButton, currency === c.code && styles.themeButtonActive]}
                onPress={() => setCurrency(c.code)}
              >
                <Text style={[styles.themeText, currency === c.code && styles.themeTextActive]}>
                  {c.symbol} {c.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>닉네임</Text>
            <Text style={styles.rowValue}>{nickname ?? '-'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>버전</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
        </View>
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
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  rowSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    minWidth: 20,
    textAlign: 'center',
  },
  logoutRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  themeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  themeTextActive: {
    color: '#FFFFFF',
  },
});
