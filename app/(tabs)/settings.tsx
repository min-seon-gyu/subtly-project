import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, TextInput, Share, Linking } from 'react-native';
import { SafeAreaView, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { ColorScheme } from '../../constants/colors';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useBudgetStore } from '../../stores/useBudgetStore';
import { useSubscriptionStore } from '../../stores/useSubscriptionStore';

const THEME_OPTIONS = [
  { label: '시스템', value: 'system' as const },
  { label: '라이트', value: 'light' as const },
  { label: '다크', value: 'dark' as const },
];

export default function SettingsScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const { enabled: notificationEnabled, reminderDays, reminderHour, setEnabled: setNotificationEnabled, setReminderDays, setReminderHour } = useNotificationStore();
  const { nickname, logout, deleteAccount } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const { monthlyBudget, setBudget } = useBudgetStore();
  const { subscriptions } = useSubscriptionStore();
  const [budgetInput, setBudgetInput] = useState(monthlyBudget?.toString() ?? '');

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: logout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '모든 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: deleteAccount },
      ],
    );
  };

  const handleExportCSV = async () => {
    if (subscriptions.length === 0) {
      Alert.alert('내보내기', '내보낼 구독 데이터가 없습니다.');
      return;
    }
    const header = '서비스명,금액,통화,결제주기,결제일,카테고리,상태,결제수단,시작일,종료일,메모';
    const rows = subscriptions.map((s) =>
      [s.name, s.price, s.currency ?? 'KRW', s.billingCycle, s.billingDate, s.category, s.isActive ? '활성' : '비활성', s.paymentMethod ?? '', s.startDate ?? '', s.endDate ?? '', s.memo ?? ''].join(',')
    );
    const csv = [header, ...rows].join('\n');
    try {
      await Share.share({ message: csv, title: 'Subtly 구독 데이터' });
    } catch {
      Alert.alert('내보내기 실패', '데이터를 내보낼 수 없습니다.');
    }
  };

  const handleBudgetSave = () => {
    const value = parseInt(budgetInput, 10);
    if (!budgetInput.trim() || isNaN(value) || value <= 0) {
      setBudget(null);
      setBudgetInput('');
    } else {
      setBudget(value);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              trackColor={{ true: colors.primary }}
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
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>알림 시간</Text>
              <Text style={styles.rowSub}>매일 {reminderHour}시에 알림</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setReminderHour(Math.max(6, reminderHour - 1))}
              >
                <Text style={styles.stepperText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{reminderHour}시</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setReminderHour(Math.min(22, reminderHour + 1))}
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
          <Text style={styles.sectionTitle}>예산</Text>
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>월 예산</Text>
              <Text style={styles.rowSub}>설정하면 홈 화면에 진행률이 표시됩니다</Text>
            </View>
          </View>
          <View style={styles.budgetRow}>
            <TextInput
              style={styles.budgetInput}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="예: 100000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              onBlur={handleBudgetSave}
            />
            <TouchableOpacity style={styles.budgetSaveButton} onPress={handleBudgetSave}>
              <Text style={styles.budgetSaveText}>{monthlyBudget ? '변경' : '설정'}</Text>
            </TouchableOpacity>
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
          <TouchableOpacity style={styles.logoutRow} onPress={handleDeleteAccount}>
            <Text style={styles.deleteText}>계정 삭제</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>데이터</Text>
          <TouchableOpacity style={styles.logoutRow} onPress={handleExportCSV}>
            <Text style={[styles.rowLabel, { color: colors.primary }]}>구독 데이터 내보내기 (CSV)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>정보</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>버전</Text>
            <Text style={styles.rowValue}>1.0.0</Text>
          </View>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://min-seon-gyu.github.io/subtly/legal/privacy.html')}
          >
            <Text style={styles.rowLabel}>개인정보처리방침</Text>
            <Text style={styles.rowValue}>{'>'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.row}
            onPress={() => Linking.openURL('https://min-seon-gyu.github.io/subtly/legal/terms.html')}
          >
            <Text style={styles.rowLabel}>이용약관</Text>
            <Text style={styles.rowValue}>{'>'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
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
    color: colors.text,
  },
  rowSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  rowValue: {
    fontSize: 15,
    color: colors.textSecondary,
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
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  logoutRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  budgetInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  budgetSaveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  budgetSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  themeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  themeTextActive: {
    color: '#FFFFFF',
  },
});
