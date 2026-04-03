import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { useSubscriptionStore } from '../stores/useSubscriptionStore';
import { useNotificationStore } from '../stores/useNotificationStore';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data;
}

export async function schedulePaymentReminder(
  subscriptionName: string,
  billingDate: number,
  reminderDaysBefore: number,
  hour: number = 9,
) {
  const now = new Date();
  let dueDate = new Date(now.getFullYear(), now.getMonth(), billingDate);

  if (dueDate <= now) {
    dueDate = new Date(now.getFullYear(), now.getMonth() + 1, billingDate);
  }

  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - reminderDaysBefore);
  reminderDate.setHours(hour, 0, 0, 0);

  if (reminderDate <= now) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '결제일 알림',
      body: `${subscriptionName} 결제일이 ${reminderDaysBefore}일 후입니다.`,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });
}

export async function scheduleEndDateReminder(
  subscriptionName: string,
  endDate: string,
  hour: number = 9,
) {
  const now = new Date();
  const end = new Date(endDate);
  if (isNaN(end.getTime())) return;

  // 7일 전, 3일 전, 당일 알림
  const reminders = [
    { daysBefore: 7, title: '약정 종료 예정', body: `${subscriptionName} 약정이 7일 후 종료됩니다. 갱신 여부를 확인하세요.` },
    { daysBefore: 3, title: '약정 종료 임박', body: `${subscriptionName} 약정이 3일 후 종료됩니다.` },
    { daysBefore: 0, title: '약정 종료일', body: `${subscriptionName} 약정이 오늘 종료됩니다.` },
  ];

  for (const r of reminders) {
    const reminderDate = new Date(end);
    reminderDate.setDate(reminderDate.getDate() - r.daysBefore);
    reminderDate.setHours(hour, 0, 0, 0);

    if (reminderDate <= now) continue;

    await Notifications.scheduleNotificationAsync({
      content: { title: r.title, body: r.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
    });
  }
}

export async function rescheduleAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  const { enabled, reminderDays, reminderHour } = useNotificationStore.getState();
  if (!enabled) return;

  const { subscriptions } = useSubscriptionStore.getState();
  const active = subscriptions.filter((s) => s.isActive);

  for (const sub of active) {
    await schedulePaymentReminder(sub.name, sub.billingDate, reminderDays, reminderHour);
  }

  // 약정 종료 알림 (활성/비활성 모두 — 비활성도 약정은 남아있을 수 있음)
  for (const sub of subscriptions) {
    if (sub.endDate) {
      await scheduleEndDateReminder(sub.name, sub.endDate, reminderHour);
    }
  }
}

export function useNotification() {
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const enabled = useNotificationStore((s) => s.enabled);
  const reminderDays = useNotificationStore((s) => s.reminderDays);
  const reminderHour = useNotificationStore((s) => s.reminderHour);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  useEffect(() => {
    if (subscriptions.length > 0) {
      rescheduleAllNotifications();
    }
  }, [subscriptions, enabled, reminderDays, reminderHour]);
}
