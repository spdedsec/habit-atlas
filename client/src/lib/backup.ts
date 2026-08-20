/**
 * Habit Atlas style reminder: export/import is portable and human-owned, not a cloud convenience feature.
 */
import { db } from "./db";
import type { BackupPayload, Habit } from "./domain";

export async function createBackup(): Promise<BackupPayload> {
  const [habits, completions, routines, goals, dailyNotes, settings] = await Promise.all([
    db.habits.toArray(),
    db.completions.toArray(),
    db.routines.toArray(),
    db.goals.toArray(),
    db.dailyNotes.toArray(),
    db.settings.get("preferences"),
  ]);
  return { schemaVersion: 2, exportedAt: new Date().toISOString(), app: "Habit Atlas", habits, completions, routines, goals, dailyNotes, settings };
}

export function downloadText(filename: string, text: string, type = "application/json") {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
}

export async function exportJson() {
  const backup = await createBackup();
  downloadText(`habit-atlas-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(backup, null, 2));
}

export async function exportCsv() {
  const [habits, entries] = await Promise.all([db.habits.toArray(), db.completions.toArray()]);
  const habitNames = new Map(habits.map((habit) => [habit.id, habit.name]));
  const rows = ["date,habit,status,value,note"];
  for (const entry of entries) rows.push([entry.date, habitNames.get(entry.habitId) || "Archived habit", entry.status, entry.value, entry.note || ""].map(csvCell).join(","));
  downloadText(`habit-atlas-history-${new Date().toISOString().slice(0, 10)}.csv`, rows.join("\n"), "text/csv");
}

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export function validateBackup(input: unknown): BackupPayload {
  if (!input || typeof input !== "object") throw new Error("This file is not a Habit Atlas backup.");
  const data = input as Partial<BackupPayload>;
  if (data.app !== "Habit Atlas" || !Array.isArray(data.habits) || !Array.isArray(data.completions)) throw new Error("This backup is missing required Habit Atlas data.");
  return data as BackupPayload;
}

export async function importBackup(payload: BackupPayload, mode: "merge" | "replace") {
  await db.transaction("rw", [db.habits, db.completions, db.routines, db.goals, db.dailyNotes, db.settings], async () => {
    if (mode === "replace") {
      await Promise.all([db.habits.clear(), db.completions.clear(), db.routines.clear(), db.goals.clear(), db.dailyNotes.clear()]);
    }
    await db.habits.bulkPut(payload.habits as Habit[]);
    await db.completions.bulkPut(payload.completions);
    if (payload.routines?.length) await db.routines.bulkPut(payload.routines);
    if (payload.goals?.length) await db.goals.bulkPut(payload.goals);
    if (payload.dailyNotes?.length) await db.dailyNotes.bulkPut(payload.dailyNotes);
    if (payload.settings) await db.settings.put(payload.settings);
  });
}
