import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  type TextInput as TextInputType,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { CATEGORIES } from '../constants/colors';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';
import { BillingCycle, Currency, CreateSubscriptionRequest } from '../types/subscription';
import DateInput from './DateInput';

interface Props {
  initialValues?: Partial<CreateSubscriptionRequest>;
  onSubmit: (data: CreateSubscriptionRequest) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}

const CYCLES: { label: string; sub: string; value: BillingCycle }[] = [
  { label: '매월', sub: '월 결제', value: 'monthly' },
  { label: '매년', sub: '연 결제', value: 'yearly' },
  { label: '매주', sub: '주 결제', value: 'weekly' },
];

export default function SubscriptionForm({ initialValues, onSubmit, onCancel, submitLabel = '추가', isSubmitting = false }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const priceRef = useRef<TextInputType>(null);
  const billingDateRef = useRef<TextInputType>(null);
  const [name, setName] = useState(initialValues?.name ?? '');
  const [rawPrice, setRawPrice] = useState(initialValues?.price?.toString() ?? '');
  const price = rawPrice;
  const setPrice = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setRawPrice(digits);
  };
  const displayPrice = rawPrice ? Number(rawPrice).toLocaleString('ko-KR') : '';
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialValues?.billingCycle ?? 'monthly');
  const [billingDate, setBillingDate] = useState(initialValues?.billingDate?.toString() ?? '1');
  const [category, setCategory] = useState(initialValues?.category ?? 'other');
  const [memo, setMemo] = useState(initialValues?.memo ?? '');
  const [currency, setCurrency] = useState<Currency>(initialValues?.currency ?? 'KRW');
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
      currency,
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
          autoFocus={!initialValues?.name}
          returnKeyType="next"
          onSubmitEditing={() => priceRef.current?.focus()}
        />

        <View style={styles.priceHeader}>
          <Text style={styles.label}>금액</Text>
          <View style={styles.currencyToggle}>
            {(['KRW', 'USD'] as Currency[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.currencyChip, currency === c && styles.currencyChipActive]}
                onPress={() => setCurrency(c)}
              >
                <Text style={[styles.currencyText, currency === c && styles.currencyTextActive]}>
                  {c === 'KRW' ? '₩ 원' : '$ USD'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={[styles.priceRow, price.length > 0 && priceError && styles.inputError]}>
          <Text style={styles.pricePrefix}>{currency === 'KRW' ? '₩' : '$'}</Text>
          <TextInput
            ref={priceRef}
            style={styles.priceInput}
            value={displayPrice}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            returnKeyType="next"
            onSubmitEditing={() => billingDateRef.current?.focus()}
          />
        </View>
        {price.length > 0 && priceError && <Text style={styles.errorText}>{priceError}</Text>}

        <Text style={styles.label}>결제 주기</Text>
        <View style={styles.cycleRow}>
          {CYCLES.map((c) => (
            <TouchableOpacity
              key={c.value}
              style={[styles.cycleButton, billingCycle === c.value && styles.cycleButtonActive]}
              onPress={() => setBillingCycle(c.value)}
            >
              <Text style={[styles.cycleLabel, billingCycle === c.value && styles.cycleLabelActive]}>
                {c.label}
              </Text>
              <Text style={[styles.cycleSub, billingCycle === c.value && styles.cycleSubActive]}>
                {c.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>결제일</Text>
        <View style={styles.dateGrid}>
          {[1, 5, 10, 15, 20, 25].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dateChip, billingDate === String(d) && styles.dateChipActive]}
              onPress={() => setBillingDate(String(d))}
            >
              <Text style={[styles.dateChipText, billingDate === String(d) && styles.dateChipTextActive]}>
                {d}일
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.dateCustomRow}>
          <Text style={styles.dateCustomLabel}>직접 입력</Text>
          <TextInput
            ref={billingDateRef}
            style={[styles.dateCustomInput, billingDate.length > 0 && dateError && styles.inputError]}
            value={billingDate}
            onChangeText={setBillingDate}
            placeholder="1-31"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.dateCustomSuffix}>일</Text>
        </View>
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
        <DateInput value={startDate} onChange={setStartDate} placeholder="시작일 선택" />

        <Text style={styles.label}>약정 종료일 (선택)</Text>
        <DateInput value={endDate} onChange={setEndDate} placeholder="종료일 선택" />

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
            style={[styles.submitButton, (!isValid || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitText}>{submitLabel}</Text>
            )}
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
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  currencyToggle: {
    flexDirection: 'row',
    gap: 6,
  },
  currencyChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  currencyChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  currencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  currencyTextActive: {
    color: '#FFFFFF',
  },
  pricePrefix: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingLeft: 14,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: 14,
  },
  priceInput: {
    flex: 1,
    padding: 14,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
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
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cycleButtonActive: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  cycleLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  cycleLabelActive: {
    color: colors.primary,
  },
  cycleSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  cycleSubActive: {
    color: colors.primary,
  },
  dateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    width: '15%',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  dateChipTextActive: {
    color: '#FFFFFF',
  },
  dateCustomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  dateCustomLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  dateCustomInput: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    width: 60,
    textAlign: 'center',
  },
  dateCustomSuffix: {
    fontSize: 14,
    color: colors.textSecondary,
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
