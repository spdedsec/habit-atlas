/**
 * Habit Atlas style reminder: indexed data is authoritative and private, with versioned migrations.
 * This file deliberately contains no account, telemetry, or remote-sync dependencies.
 */
import Dexie, { type EntityTable } from "dexie";
import type { AppSettings, DailyNote, Goal, Habit, HabitCompletion, Routine } from "./domain";
import { initialSettings } from "./domain";

class HabitAtlasDatabase extends Dexie {
  habits!: EntityTable<Habit, "id">;
  completions!: EntityTable<HabitCompletion, "id">;
  routines!: EntityTable<Routine, "id">;
  goals!: EntityTable<Goal, "id">;
  dailyNotes!: EntityTable<DailyNote, "id">;
  settings!: EntityTable<AppSettings, "id">;

  constructor() {
    super("habit-atlas");
    this.version(1).stores({
      habits: "id, name, archived, category, createdAt, updatedAt, *tags",
      completions: "id, habitId, date, status, [habitId+date], updatedAt",
      settings: "id",
    });
    this.version(2).stores({
      habits: "id, name, archived, category, createdAt, updatedAt, *tags",
      completions: "id, habitId, date, status, [habitId+date], updatedAt",
      routines: "id, name, createdAt",
      goals: "id, habitId, createdAt",
      dailyNotes: "id, date, updatedAt",
      settings: "id",
    });
  }
}

export const db = new HabitAtlasDatabase();

export async function ensurePreferences() {
  const existing = await db.settings.get("preferences");
  if (!existing) await db.settings.put(initialSettings());
}

export async function clearAllLocalData() {
  await db.transaction("rw", [db.habits, db.completions, db.routines, db.goals, db.dailyNotes, db.settings], async () => {
    await Promise.all([
      db.habits.clear(),
      db.completions.clear(),
      db.routines.clear(),
      db.goals.clear(),
      db.dailyNotes.clear(),
      db.settings.clear(),
    ]);
    await db.settings.put(initialSettings());
  });
}
