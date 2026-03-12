import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import api from '@/services/api';

export async function registerPushNotifications(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  let permStatus = await PushNotifications.checkPermissions();
  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions();
  }
  if (permStatus.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', async (token) => {
    try {
      await api.post('/push-subscriptions', {
        endpoint: token.value,
        platform: Capacitor.getPlatform(),
      });
    } catch {
      // silently fail — will retry on next app open
    }
  });

  PushNotifications.addListener('registrationError', () => {
    // registration failed — no action needed
  });
}

export function onPushNotificationTap(callback: (data: Record<string, string>) => void): void {
  if (!Capacitor.isNativePlatform()) return;

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    const data = notification.notification.data ?? {};
    callback(data);
  });
}

export async function scheduleLocalReminder(
  id: number,
  title: string,
  body: string,
  at: Date,
): Promise<void> {
  const { value: enabled } = await Preferences.get({ key: 'pref_notifications_reminders' });
  if (enabled === 'false') return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title,
        body,
        schedule: { at, allowWhileIdle: true },
        channelId: 'reminders',
      },
    ],
  });
}

export async function showSyncCompleteNotification(count: number): Promise<void> {
  const { value: enabled } = await Preferences.get({ key: 'pref_notifications_sync' });
  if (enabled === 'false') return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title: 'Sync Complete',
        body: `${count} transaction${count !== 1 ? 's' : ''} synced successfully`,
        channelId: 'sync',
      },
    ],
  });
}

export async function showLowBalanceAlert(accountName: string, balance: string): Promise<void> {
  const { value: enabled } = await Preferences.get({ key: 'pref_notifications_alerts' });
  if (enabled === 'false') return;

  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now(),
        title: 'Low Balance Alert',
        body: `${accountName} balance is ${balance}`,
        channelId: 'alerts',
      },
    ],
  });
}

export async function setupNotificationChannels(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;

  await LocalNotifications.createChannel({
    id: 'reminders',
    name: 'Reminders',
    description: 'Scheduled transaction reminders',
    importance: 4,
  });
  await LocalNotifications.createChannel({
    id: 'sync',
    name: 'Sync',
    description: 'Sync status notifications',
    importance: 2,
  });
  await LocalNotifications.createChannel({
    id: 'alerts',
    name: 'Alerts',
    description: 'Balance and account alerts',
    importance: 4,
  });
}

// Notification preferences helpers
export type NotificationPrefKey = 'pref_notifications_reminders' | 'pref_notifications_sync' | 'pref_notifications_alerts';

export async function getNotificationPref(key: NotificationPrefKey): Promise<boolean> {
  const { value } = await Preferences.get({ key });
  return value !== 'false'; // default true
}

export async function setNotificationPref(key: NotificationPrefKey, enabled: boolean): Promise<void> {
  await Preferences.set({ key, value: String(enabled) });
}
