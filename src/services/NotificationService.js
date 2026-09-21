import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification behavior for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initializes notification channels and handlers
   */
  async init() {
    if (this.initialized) return;

    try {
      if (Platform.OS === 'android') {
        // High priority channel for habit reminders
        await Notifications.setNotificationChannelAsync('habit-reminders', {
          name: 'Alışkanlık Hatırlatıcıları',
          description: 'Belirlenen saatlerde alışkanlıklarınızı yapmanız için hatırlatmalar',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6366F1',
          sound: 'default',
        });

        // High priority channel for streak protection & morning motivation
        await Notifications.setNotificationChannelAsync('streak-protection', {
          name: 'Seri Koruma & Günlük Özet',
          description: 'Seriniz tehlikedeyken veya günlük başlangıç bildirimleri',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 200, 200, 200],
          lightColor: '#EC4899',
          sound: 'default',
        });
      }
      this.initialized = true;
    } catch (e) {
      console.warn('⚠️ NotificationService init warning:', e?.message || e);
    }
  }

  /**
   * Checks current permission status without prompting
   */
  async checkPermissions() {
    try {
      const settings = await Notifications.getPermissionsAsync();
      return {
        granted: settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.AUTHORIZED,
        canAskAgain: settings.canAskAgain,
        status: settings.status,
      };
    } catch (e) {
      console.warn('⚠️ Notification permission check error:', e?.message || e);
      return { granted: false, canAskAgain: true, status: 'undetermined' };
    }
  }

  /**
   * Requests notification permissions (Android 13+ POST_NOTIFICATIONS and iOS)
   */
  async requestPermissions() {
    await this.init();
    try {
      const existing = await Notifications.getPermissionsAsync();
      if (existing.granted) {
        return true;
      }

      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      return status === 'granted';
    } catch (e) {
      console.warn('⚠️ Notification request permission error:', e?.message || e);
      return false;
    }
  }

  /**
   * Parses time string or Date into hour & minute integers
   */
  parseHourMinute(reminderTime) {
    if (!reminderTime) return null;

    if (typeof reminderTime === 'string') {
      // Check "HH:MM" format
      if (reminderTime.includes(':') && !reminderTime.includes('T')) {
        const parts = reminderTime.split(':');
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        if (!isNaN(h) && !isNaN(m)) return { hour: h, minute: m };
      }

      // Check ISO string
      const date = new Date(reminderTime);
      if (!isNaN(date.getTime())) {
        return { hour: date.getHours(), minute: date.getMinutes() };
      }
    } else if (reminderTime instanceof Date && !isNaN(reminderTime.getTime())) {
      return { hour: reminderTime.getHours(), minute: reminderTime.getMinutes() };
    }

    return null;
  }

  /**
   * Schedules a daily repeating reminder for a single habit
   */
  async scheduleHabitReminder(habit) {
    if (!habit || !habit.id || !habit.reminderTime) return null;

    const time = this.parseHourMinute(habit.reminderTime);
    if (!time) return null;

    try {
      await this.init();
      // Cancel previous reminder for this habit if any
      await this.cancelHabitReminder(habit.id);

      const identifier = `habit-reminder-${habit.id}`;
      const scheduledId = await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: `⏰ ${habit.name}`,
          body: 'Günün hedefini tamamlama vakti! Serini bozma.',
          data: { habitId: habit.id, type: 'habit_reminder' },
          sound: true,
          channelId: 'habit-reminders',
        },
        trigger: {
          hour: time.hour,
          minute: time.minute,
          repeats: true,
          channelId: 'habit-reminders',
        },
      });

      return scheduledId;
    } catch (e) {
      console.warn(`⚠️ Failed to schedule reminder for habit ${habit.id}:`, e?.message || e);
      return null;
    }
  }

  /**
   * Cancels scheduled reminder for a specific habit
   */
  async cancelHabitReminder(habitId) {
    if (!habitId) return;
    try {
      const identifier = `habit-reminder-${habitId}`;
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (e) {
      // Silent catch if notification didn't exist
    }
  }

  /**
   * Synchronizes all habit reminders from active habits list
   */
  async syncAllHabitReminders(habits) {
    if (!Array.isArray(habits)) return;

    try {
      const perm = await this.checkPermissions();
      if (!perm.granted) return;

      for (const habit of habits) {
        if (habit.reminderTime) {
          await this.scheduleHabitReminder(habit);
        } else {
          await this.cancelHabitReminder(habit.id);
        }
      }
    } catch (e) {
      console.warn('⚠️ Sync habit reminders error:', e?.message || e);
    }
  }

  /**
   * Schedules a generic daily check-in (e.g. 09:00 morning motivation)
   */
  async scheduleDailyReview(hour = 9, minute = 0) {
    try {
      await this.init();
      const identifier = 'daily-morning-review';
      try {
        await Notifications.cancelScheduledNotificationAsync(identifier);
      } catch (_) {}

      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: '☀️ Günaydın!',
          body: 'Bugünkü alışkanlıklarını kontrol etme ve güne odaklanma vakti.',
          data: { type: 'daily_review' },
          sound: true,
          channelId: 'streak-protection',
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          channelId: 'streak-protection',
        },
      });
    } catch (e) {
      console.warn('⚠️ Daily review reminder error:', e?.message || e);
    }
  }
}

const notificationServiceInstance = new NotificationService();
export default notificationServiceInstance;
