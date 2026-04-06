import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../hooks/useTheme';
import { ColorScheme } from '../constants/colors';

interface Props {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

function parseDate(value: string): Date {
  if (!value) return new Date();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function DateInput({ value, onChange, placeholder = '날짜 선택' }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(parseDate(value));

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (_event.type === 'set' && selectedDate) {
        onChange(formatDate(selectedDate));
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirmIOS = () => {
    onChange(formatDate(tempDate));
    setShow(false);
  };

  const handleClear = () => {
    onChange('');
    setShow(false);
  };

  return (
    <View>
      <TouchableOpacity style={styles.trigger} onPress={() => {
        setTempDate(parseDate(value));
        setShow(true);
      }}>
        <Text style={value ? styles.triggerText : styles.triggerPlaceholder}>
          {value ? formatDisplay(value) : placeholder}
        </Text>
        {value ? (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.clearIcon}>X</Text>
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      {show && Platform.OS === 'ios' && (
        <View style={styles.iosContainer}>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={handleChange}
            locale="ko"
          />
          <View style={styles.iosButtons}>
            <TouchableOpacity style={styles.iosCancelButton} onPress={() => setShow(false)}>
              <Text style={styles.iosCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iosConfirmButton} onPress={handleConfirmIOS}>
              <Text style={styles.iosConfirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="calendar"
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const createStyles = (colors: ColorScheme) => StyleSheet.create({
  trigger: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 16,
    color: colors.text,
  },
  triggerPlaceholder: {
    fontSize: 16,
    color: colors.textMuted,
  },
  clearIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
    paddingHorizontal: 4,
  },
  iosContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
  },
  iosButtons: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  iosCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  iosCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  iosConfirmButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  iosConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
