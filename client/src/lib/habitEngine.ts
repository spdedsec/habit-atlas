/**
 * Habit Atlas style reminder: scheduling and streaks are deterministic, timezone-aware local calculations.
 * Measurements are translated to calm, legible contribution intensity instead of binary-only tracking.
 */
import type { CompletionStatus, Habit, HabitCompletion, HabitSchedule } from "./domain";
import { dateKey, localDate } from "./domain";

export type HabitStats = {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;
  totalCompletions: number;
  scheduledOccurrences: number;
  averageValue: number;
};

export function isScheduledOn(schedule: HabitSchedule, date: string) {
  const current = localDate(date);
  const start = localDate(schedule.startDate || date);
  if (current < start) return false;
  const day = current.getDay();
  switch (schedule.kind) {
    case "daily":
      return true;
    case "weekdays":
      return day >= 1 && day <= 5;
    case "weekends":
      return day === 0 || day === 6;
    case "selectedDays":
      return (schedule.days || []).includes(day);
    case "everyNDays": {
      const diff = Math.floor((current.getTime() - start.getTime()) / 86_400_000);
      return diff % Math.max(1, schedule.interval || 1) === 0;
    }
    case "weeklyTarget":
    case "monthlyTarget":
      return true;
  }
}

export function getPeriodKey(date: string, kind: "week" | "month") {
  const value = localDate(date);
  if (kind === "month") return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
  const day = value.getDay() || 7;
  value.setDate(value.getDate() + 4 - day);
  const yearStart = new Date(value.getFullYear(), 0, 1);
  const week = Math.ceil(((value.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${value.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function completionProgress(habit: Habit, value: number, status?: CompletionStatus) {
  if (status === "skipped") return 0;
  if (habit.measurement === "binary") return status === "completed" || value > 0 ? 1 : 0;
  return Math.min(1, Math.max(0, value / Math.max(1, habit.target)));
}

export function intensityFor(habit: Habit, value: number, status?: CompletionStatus) {
  if (status === "skipped" || value <= 0) return 0;
  const progress = completionProgress(habit, value, status);
  if (progress >= 1) return 4;
  if (progress >= 0.66) return 3;
  if (progress >= 0.33) return 2;
  return 1;
}

export function isSuccessful(habit: Habit, completion?: HabitCompletion) {
  return Boolean(completion && completion.status !== "skipped" && completionProgress(habit, completion.value, completion.status) >= 1);
}

export function isDueToday(habit: Habit, completions: HabitCompletion[], date = dateKey()) {
  if (!isScheduledOn(habit.schedule, date)) return false;
  if (habit.schedule.kind === "weeklyTarget" || habit.schedule.kind === "monthlyTarget") {
    const unit = habit.schedule.kind === "weeklyTarget" ? "week" : "month";
    const key = getPeriodKey(date, unit);
    const total = completions.filter((entry) => entry.habitId === habit.id && getPeriodKey(entry.date, unit) === key && isSuccessful(habit, entry)).length;
    return total < (habit.schedule.targetOccurrences || 1);
  }
  return true;
}

export function dateRange(days: number, end = dateKey()) {
  const last = localDate(end);
  return Array.from({ length: days }, (_, index) => {
    const current = new Date(last);
    current.setDate(last.getDate() - (days - index - 1));
    return dateKey(current);
  });
}

export function calculateStats(habit: Habit, completions: HabitCompletion[], days = 365): HabitStats {
  const records = new Map(completions.filter((entry) => entry.habitId === habit.id).map((entry) => [entry.date, entry]));
  const dates = dateRange(days).filter((date) => isScheduledOn(habit.schedule, date));
  const successfulDates = dates.filter((date) => isSuccessful(habit, records.get(date)));
  let currentStreak = 0;
  let bestStreak = 0;
  let running = 0;
  for (const date of dates) {
    if (isSuccessful(habit, records.get(date))) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  }
  for (const date of [...dates].reverse()) {
    if (isSuccessful(habit, records.get(date))) currentStreak += 1;
    else break;
  }
  const entries = Array.from(records.values());
  return {
    currentStreak,
    bestStreak,
    completionRate: dates.length ? Math.round((successfulDates.length / dates.length) * 100) : 0,
    totalCompletions: successfulDates.length,
    scheduledOccurrences: dates.length,
    averageValue: entries.length ? Math.round((entries.reduce((sum, entry) => sum + entry.value, 0) / entries.length) * 10) / 10 : 0,
  };
}

export function aggregateIntensity(habits: Habit[], completions: HabitCompletion[], date: string) {
  const scheduled = habits.filter((habit) => isScheduledOn(habit.schedule, date));
  if (!scheduled.length) return 0;
  const progress = scheduled.reduce((sum, habit) => {
    const entry = completions.find((record) => record.habitId === habit.id && record.date === date);
    return sum + (entry ? completionProgress(habit, entry.value, entry.status) : 0);
  }, 0) / scheduled.length;
  return progress === 0 ? 0 : Math.max(1, Math.min(4, Math.ceil(progress * 4)));
}
