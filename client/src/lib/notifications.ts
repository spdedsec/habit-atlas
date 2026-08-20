/**
 * Habit Atlas style reminder: reminders are opt-in local device actions, never cloud-delivered nudges.
 */
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { Habit } from "./domain";

const notificationId = (id: string) => Array.from(id).reduce((total, char) => (total * 31 + char.charCodeAt(0)) >>> 0, 17) % 2_000_000_000;

export async function requestLocalReminderPermission() {
  if (Capacitor.isNativePlatform()) return LocalNotifications.requestPermissions();
  if ("Notification" in window) return Notification.requestPermission();
  return { display: "denied" as const };
}

export async function syncHabitReminder(habit: Habit) {
  if (!Capacitor.isNativePlatform() || !habit.reminder?.enabled) return;
  const id = notificationId(habit.id);
  await LocalNotifications.cancel({ notifications: [{ id }] });
  await LocalNotifications.schedule({
    notifications: [{
      id,
      title: "Habit Atlas",
      body: `A small mark for ${habit.name}.`,
      schedule: { on: { hour: habit.reminder.hour, minute: habit.reminder.minute }, repeats: true, allowWhileIdle: true },
      extra: { habitId: habit.id },
      actionTypeId: "HABIT_ACTION",
    }],
  });
}
