/**
 * Habit Atlas style reminder: this hook is the local-only bridge between the fieldbook UI and IndexedDB.
 * Every mutation is immediate, private, and survives an app restart without an account.
 */
import { useLiveQuery } from "dexie-react-hooks";
import { useCallback, useEffect, useMemo } from "react";
import { db, ensurePreferences } from "@/lib/db";
import { dateKey, type Habit, type HabitCompletion, uid } from "@/lib/domain";
import { completionProgress } from "@/lib/habitEngine";

export function useHabitData() {
  useEffect(() => { void ensurePreferences(); }, []);
  const habits = useLiveQuery(() => db.habits.orderBy("createdAt").reverse().toArray(), []) || [];
  const completions = useLiveQuery(() => db.completions.toArray(), []) || [];
  const routines = useLiveQuery(() => db.routines.toArray(), []) || [];
  const goals = useLiveQuery(() => db.goals.toArray(), []) || [];
  const settings = useLiveQuery(() => db.settings.get("preferences"), []);
  const activeHabits = useMemo(() => habits.filter((habit) => !habit.archived), [habits]);

  const completionFor = useCallback((habitId: string, date = dateKey()) => completions.find((entry) => entry.habitId === habitId && entry.date === date), [completions]);

  const setCompletion = useCallback(async (habit: Habit, value: number, date = dateKey(), status?: HabitCompletion["status"]) => {
    const existing = await db.completions.where("[habitId+date]").equals([habit.id, date]).first();
    const progress = completionProgress(habit, value, status);
    const now = new Date().toISOString();
    const nextStatus = status || (progress >= 1 ? "completed" : progress > 0 ? "partial" : "missed");
    if (value <= 0 && nextStatus !== "skipped") {
      if (existing) await db.completions.delete(existing.id);
      return;
    }
    await db.completions.put({
      id: existing?.id || uid(), habitId: habit.id, date, value, status: nextStatus,
      createdAt: existing?.createdAt || now, updatedAt: now,
    });
  }, []);

  const toggleCompletion = useCallback(async (habit: Habit, date = dateKey()) => {
    const entry = await db.completions.where("[habitId+date]").equals([habit.id, date]).first();
    if (entry && completionProgress(habit, entry.value, entry.status) >= 1) {
      await db.completions.delete(entry.id);
    } else {
      await setCompletion(habit, habit.measurement === "binary" ? 1 : habit.target, date, "completed");
    }
  }, [setCompletion]);

  const archiveHabit = useCallback(async (habit: Habit) => {
    await db.habits.put({ ...habit, archived: !habit.archived, updatedAt: new Date().toISOString() });
  }, []);

  return { habits, activeHabits, completions, routines, goals, settings, completionFor, setCompletion, toggleCompletion, archiveHabit };
}
