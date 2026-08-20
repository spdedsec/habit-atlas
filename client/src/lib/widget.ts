/**
 * Habit Atlas style reminder: widgets receive only a minimal local snapshot and return into the private fieldbook.
 * The native widget is a convenience surface; IndexedDB remains the authoritative habit record.
 */
import { Capacitor, registerPlugin } from "@capacitor/core";
import { dateKey, type Habit, type HabitCompletion } from "./domain";
import { completionProgress, isDueToday } from "./habitEngine";

type WidgetPlugin = {
  updateSnapshot(options: { title: string; subtitle: string; progress: string; quickHabitId?: string; quickHabitName?: string }): Promise<void>;
};

const HabitAtlasWidget = registerPlugin<WidgetPlugin>("HabitAtlasWidget");

export async function syncTodayWidget(habits: Habit[], completions: HabitCompletion[]) {
  if (!Capacitor.isNativePlatform()) return;
  const due = habits.filter((habit) => isDueToday(habit, completions, dateKey()));
  const done = due.filter((habit) => {
    const entry = completions.find((item) => item.habitId === habit.id && item.date === dateKey());
    return Boolean(entry && completionProgress(habit, entry.value, entry.status) >= 1);
  });
  const next = due.find((habit) => !done.some((item) => item.id === habit.id));
  await HabitAtlasWidget.updateSnapshot({
    title: "Habit Atlas",
    subtitle: due.length ? `${done.length} of ${due.length} marks today` : "Your page is clear for today.",
    progress: due.length ? `${Math.round((done.length / due.length) * 100)}%` : "—",
    quickHabitId: next?.id,
    quickHabitName: next?.name,
  });
}
