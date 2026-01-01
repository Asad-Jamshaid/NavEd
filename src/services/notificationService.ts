// ==========================================
// Notification Service
// Handles all push notifications using Expo Notifications (FREE)
// ==========================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  NOTIFICATION_TOKEN: '@naved_notification_token',
  NOTIFICATION_SETTINGS: '@naved_notification_settings',
};

export interface NotificationSettings {
  parkingAlerts: boolean;
  studyReminders: boolean;
  navigationUpdates: boolean;
  generalAnnouncements: boolean;
}

// ==========================================
// Notification Channels (Android)
// ==========================================
export enum NotificationChannel {
  PARKING = 'parking',
  STUDY = 'study',
  NAVIGATION = 'navigation',
  GENERAL = 'general',
}

const NOTIFICATION_CHANNELS = [
  {
    id: NotificationChannel.PARKING,
    name: 'Parking Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    description: 'Alerts about parking availability and peak hours',
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF6B6B',
  },
  {
    id: NotificationChannel.STUDY,
    name: 'Study Reminders',
    importance: Notifications.AndroidImportance.DEFAULT,
    description: 'Reminders for study sessions and assignments',
    sound: 'default',
    vibrationPattern: [0, 200, 100, 200],
    lightColor: '#4ECDC4',
  },
  {
    id: NotificationChannel.NAVIGATION,
    name: 'Navigation Updates',
    importance: Notifications.AndroidImportance.HIGH,
    description: 'Turn-by-turn navigation and route updates',
    sound: 'default',
    vibrationPattern: [0, 100],
    lightColor: '#45B7D1',
  },
  {
    id: NotificationChannel.GENERAL,
    name: 'General Notifications',
    importance: Notifications.AndroidImportance.LOW,
    description: 'General app notifications and announcements',
    sound: 'default',
    lightColor: '#96CEB4',
  },
];

// ==========================================
// Initialize Notification Service
// ==========================================
export async function initializeNotifications(): Promise<boolean> {
  try {
    // Check if running on physical device
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return false;
    }

    // Set up Android notification channels
    if (Platform.OS === 'android') {
      await setupAndroidChannels();
    }

    // Configure notification handler
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        // Get channel from notification
        const channel = notification.request.content.data?.channel as NotificationChannel;

        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
          priority: channel === NotificationChannel.PARKING || channel === NotificationChannel.NAVIGATION
            ? Notifications.AndroidNotificationPriority.HIGH
            : Notifications.AndroidNotificationPriority.DEFAULT,
        };
      },
    });

    // Get Expo push token (for remote notifications)
    if (Platform.OS !== 'web') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_TOKEN, token);
      console.log('Notification token:', token);
    }

    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
}

// ==========================================
// Setup Android Notification Channels
// ==========================================
async function setupAndroidChannels() {
  if (Platform.OS !== 'android') return;

  for (const channelConfig of NOTIFICATION_CHANNELS) {
    await Notifications.setNotificationChannelAsync(channelConfig.id, {
      name: channelConfig.name,
      importance: channelConfig.importance,
      description: channelConfig.description,
      sound: channelConfig.sound,
      vibrationPattern: channelConfig.vibrationPattern,
      lightColor: channelConfig.lightColor,
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: channelConfig.id === NotificationChannel.NAVIGATION, // Only navigation bypasses DND
    });
  }

  console.log('Android notification channels created');
}

// ==========================================
// Send Local Notification
// ==========================================
export async function sendLocalNotification(
  title: string,
  body: string,
  data: Record<string, any> = {},
  channel: NotificationChannel = NotificationChannel.GENERAL
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { ...data, channel },
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: channel,
      }),
    },
    trigger: null, // Send immediately
  });

  return notificationId;
}

// ==========================================
// Schedule Notification
// ==========================================
export async function scheduleNotification(
  title: string,
  body: string,
  triggerDate: Date,
  data: Record<string, any> = {},
  channel: NotificationChannel = NotificationChannel.GENERAL,
  identifier?: string
): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { ...data, channel },
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: channel,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
    identifier,
  });

  return notificationId;
}

// ==========================================
// Schedule Repeating Notification
// ==========================================
export async function scheduleRepeatingNotification(
  title: string,
  body: string,
  repeatInterval: 'minute' | 'hour' | 'day' | 'week' | 'month',
  data: Record<string, any> = {},
  channel: NotificationChannel = NotificationChannel.GENERAL,
  identifier?: string
): Promise<string> {
  // Calculate seconds for repeat interval
  const seconds: Record<typeof repeatInterval, number> = {
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { ...data, channel },
      sound: 'default',
      ...(Platform.OS === 'android' && {
        channelId: channel,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: seconds[repeatInterval],
      repeats: true,
    },
    identifier,
  });

  return notificationId;
}

// ==========================================
// Cancel Notification
// ==========================================
export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ==========================================
// Get Scheduled Notifications
// ==========================================
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

// ==========================================
// Notification Settings
// ==========================================
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
    if (json) {
      return JSON.parse(json);
    }
  } catch (error) {
    console.error('Error getting notification settings:', error);
  }

  // Default settings
  return {
    parkingAlerts: true,
    studyReminders: true,
    navigationUpdates: true,
    generalAnnouncements: false,
  };
}

export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<void> {
  try {
    const current = await getNotificationSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(
      STORAGE_KEYS.NOTIFICATION_SETTINGS,
      JSON.stringify(updated)
    );
  } catch (error) {
    console.error('Error updating notification settings:', error);
  }
}

// ==========================================
// Notification Listeners
// ==========================================
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

// ==========================================
// Helper: Check if notifications are enabled
// ==========================================
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

// ==========================================
// Helper: Open notification settings
// ==========================================
export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS === 'android') {
    // On Android, this would open the app's notification settings
    // You can use a library like expo-intent-launcher for this
    console.log('Open Android notification settings');
  } else if (Platform.OS === 'ios') {
    // On iOS, linking to settings is not directly supported
    console.log('Please enable notifications in Settings > NavEd');
  }
}
