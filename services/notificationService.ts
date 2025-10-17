import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { MedicineReminder } from '@/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export class NotificationService {
  static async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        // Web support is limited; do not block app flows
        return true;
      }
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('medicine-reminders', {
          name: 'Medicine Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3498db',
        });
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  static async scheduleMedicineReminder(reminder: MedicineReminder): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted, skipping scheduling');
        return null;
      }

      // Parse time (assuming format "HH:MM")
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      // Create trigger based on frequency
      let trigger: any;
      
      switch (reminder.frequency) {
        case 'Daily':
          trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
          };
          break;
        case 'Twice Daily':
          // Schedule for morning and evening
          trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
          };
          break;
        case 'Three Times Daily':
          // Schedule for morning, afternoon, and evening
          trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
          };
          break;
        case 'Weekly':
          trigger = {
            weekday: 1, // Monday
            hour: hours,
            minute: minutes,
            repeats: true,
          };
          break;
        default:
          trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
          };
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Medicine Reminder',
          body: `Time to take your ${reminder.medicineName} (${reminder.dosage})`,
          data: {
            reminderId: reminder.id,
            medicineName: reminder.medicineName,
          },
          sound: true,
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  }

  static async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }

  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  static async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  static async sendImmediateNotification(title: string, body: string, data?: any): Promise<void> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted, skipping immediate notification');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }
}