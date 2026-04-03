import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

interface Props {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

export default function DateInput({ value, onChange, placeholder = 'YYYY-MM-DD' }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [visible, setVisible] = useState(false);

  const parts = value ? value.split('-') : ['', '', ''];
  const [year, setYear] = useState(parts[0] || '');
  const [month, setMonth] = useState(parts[1] || '');
  const [day, setDay] = useState(parts[2] || '');

  const handleOpen = () => {
    const p = value ? value.split('-') : ['', '', ''];
    setYear(p[0] || '');
    setMonth(p[1] || '');
    setDay(p[2] || '');
    setVisible(true);
  };

  const handleConfirm = () => {
    if (year && month && day) {
      const y = year.padStart(4, '0');
      const m = month.padStart(2, '0');
      const d = day.padStart(2, '0');
      onChange(`${y}-${m}-${d}`);
    } else {
      onChange('');
    }
    setVisible(false);
  };

  const handleClear = () => {
    onChange('');
    setVisible(false);
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={handleOpen}>
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)}>
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>날짜 입력</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={year}
                  onChangeText={(t) => setYear(t.replace(/\D/g, '').slice(0, 4))}
                  placeholder="2025"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <Text style={styles.inputLabel}>년</Text>
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={month}
                  onChangeText={(t) => setMonth(t.replace(/\D/g, '').slice(0, 2))}
                  placeholder="01"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.inputLabel}>월</Text>
              </View>
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={day}
                  onChangeText={(t) => setDay(t.replace(/\D/g, '').slice(0, 2))}
                  placeholder="01"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <Text style={styles.inputLabel}>일</Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
                <Text style={styles.clearText}>초기화</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  trigger: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  triggerText: {
    fontSize: 16,
    color: colors.text,
  },
  triggerPlaceholder: {
    fontSize: 16,
    color: colors.textMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  inputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  clearText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
