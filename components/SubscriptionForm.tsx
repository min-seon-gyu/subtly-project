import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CATEGORIES } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { BillingCycle, CreateSubscriptionRequest } from '../types/subscription';

interface Props {
  initialValues?: Partial<CreateSubscriptionRequest>;
  onSubmit: (data: CreateSubscriptionRequest) => void;
  onCancel: () => void;
  submitLabel?: string;
}

const CYCLES: { label: string; value: BillingCycle }[] = [
  { label: '매월', value: 'monthly' },
  { label: '매년', value: 'yearly' },
  { label: '매주', value: 'weekly' },
];

export default function SubscriptionForm({ initialValues, onSubmit, onCancel, submitLabel = '추가' }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState(initialValues?.name ?? '');
  const [price, setPrice] = useState(initialValues?.price?.toString() ?? '');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialValues?.billingCycle ?? 'monthly');
  const [billingDate, setBillingDate] = useState(initialValues?.billingDate?.toString() ?? '1');
  const [category, setCategory] = useState(initialValues?.category ?? 'other');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? '');
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? '');
  const [paymentMethod, setPaymentMethod] = useState(initialValues?.paymentMethod ?? '');

  const selectedCategory = CATEGORIES.find((c) => c.value === category);
  const categoryColor = colors.categoryColors[CATEGORIES.findIndex((c) => c.value === category)] ?? colors.primary;

  const parsedPrice = parseInt(price, 10);
  const parsedDate = parseInt(billingDate, 10);

  const nameError = name.trim().length === 0 ? '서비스명을 입력해주세요' : null;
  const priceError = !price.trim() ? '금액을 입력해주세요' : isNaN(parsedPrice) || parsedPrice <= 0 ? '올바른 금액을 입력해주세요' : null;
  const dateError = isNaN(parsedDate) || parsedDate < 1 || parsedDate > 31 ? '1~31 사이의 결제일을 입력해주세요' : null;

  const handleSubmit = () => {
    if (nameError || priceError || dateError) return;
    onSubmit({
      name: name.trim(),
      price: parsedPrice,
      billingCycle,
      billingDate: parsedDate,
      category,
      color: initialValues?.color ?? categoryColor,
      icon: initialValues?.icon ?? selectedCategory?.icon ?? 'E',
      memo: memo.trim() || undefined,
      startDate: startDate.trim() || undefined,
      endDate: endDate.trim() || undefined,
      paymentMethod: paymentMethod.trim() || undefined,
    });
  };

  const isValid = !nameError && !priceError && !dateError;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>서비스명</Text>
        <TextInput
          style={[styles.input, name.length > 0 && nameError && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="예: Netflix, Spotify"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>금액 (원)</Text>
        <TextInput
          style={[styles.input, price.length > 0 && priceError && styles.inputError]}
          value={price}
          onChangeText={setPrice}
          placeholder="예: 17000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
        {price.length > 0 && priceError && <Text style={styles.errorText}>{priceError}</Text>}

        <Text style={styles.label}>결제 주기</Text>
        <View style={styles.cycleRow}>
          {CYCLES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.cycleButton, billingCycle === c.value && styles.cycleButtonActive]}
              onPress={() => setBillingCycle(c.value)}
            >
              <Text style={[styles.cycleText, billingCycle === c.value && styles.cycleTextActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>결제일</Text>
        <TextInput
          style={[styles.input, billingDate.length > 0 && dateError && styles.inputError]}
          value={billingDate}
          onChangeText={setBillingDate}
          placeholder="1-31"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
        {billingDate.length > 0 && dateError && <Text style={styles.errorText}>{dateError}</Text>}

        <Text style={styles.label}>카테고리</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.categoryButton, category === c.value && styles.categoryButtonActive]}
              onPress={() => setCategory(c.value)}
            >
              <Text style={styles.categoryIcon}>{c.icon}</Text>
              <Text style={[styles.categoryLabel, category === c.value && styles.categoryLabelActive]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>결제 수단 (선택)</Text>
        <TextInput
          style={styles.input}
          value={paymentMethod}
          onChangeText={setPaymentMethod}
          placeholder="예: 신한카드, 국민카드"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>구독 시작일 (선택)</Text>
        <TextInput
          style={styles.input}
          value={startDate}
          onChangeText={setStartDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>약정 종료일 (선택)</Text>
        <TextInput
          style={styles.input}
          value={endDate}
          onChangeText={setEndDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textMuted}
        />

        <Text style={styles.label}>메모 (선택)</Text>
        <TextInput
          style={[styles.input, styles.memoInput]}
          value={memo}
          onChangeText={setMemo}
          placeholder="메모를 입력하세요"
          placeholderTextColor={colors.textMuted}
          multiline
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid}
          >
            <Text style={styles.submitText}>{submitLabel}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
  },
  memoInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  cycleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cycleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cycleButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cycleText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  cycleTextActive: {
    color: '#FFFFFF',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    width: '22%',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  categoryIcon: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  categoryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  categoryLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    marginBottom: 40,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
