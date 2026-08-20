/**
 * Habit Atlas style reminder: this domain layer protects the local-first field-journal experience.
 * It contains no network concerns; calendar data belongs to the person using the app.
 */

export type HabitKind = "good" | "avoid" | "neutral";
export type MeasurementType = "binary" | "count" | "duration" | "quantity" | "percentage" | "numeric";
export type CompletionStatus = "completed" | "partial" | "skipped" | "missed";
export type ScheduleKind = "daily" | "weekdays" | "weekends" | "selectedDays" | "everyNDays" | "weeklyTarget" | "monthlyTarget";

export type HabitSchedule = {
  kind: ScheduleKind;
  days?: number[];
  interval?: number;
  startDate?: string;
  targetOccurrences?: number;
};

export type Habit = {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  category: string;
  tags: string[];
  kind: HabitKind;
  measurement: MeasurementType;
  target: number;
  unit?: string;
  schedule: HabitSchedule;
  reminder?: { enabled: boolean; hour: number; minute: number };
  graceDays?: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitCompletion = {
  id: string;
  habitId: string;
  date: string;
  status: CompletionStatus;
  value: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type DailyNote = {
  id: string;
  date: string;
  text: string;
  mood?: number;
  energy?: number;
  updatedAt: string;
};

export type Routine = {
  id: string;
  name: string;
  color: string;
  habitIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  unit: string;
  habitId?: string;
  createdAt: string;
  updatedAt: string;
};

export type AppSettings = {
  id: "preferences";
  theme: "light" | "dark" | "system";
  weekStartsOn: 0 | 1 | 6;
  timezone: string;
  onboardingComplete: boolean;
  dashboardSections: string[];
};

export type BackupPayload = {
  schemaVersion: number;
  exportedAt: string;
  app: "Habit Atlas";
  habits: Habit[];
  completions: HabitCompletion[];
  routines: Routine[];
  goals: Goal[];
  dailyNotes: DailyNote[];
  settings?: AppSettings;
};

export const categoryPalette = [
  { name: "Mind", color: "#2F63F5", icon: "✦" },
  { name: "Body", color: "#1F8A70", icon: "◒" },
  { name: "Home", color: "#D69A2D", icon: "⌂" },
  { name: "Creative", color: "#DF5C4B", icon: "✶" },
  { name: "Social", color: "#7656D8", icon: "○" },
];

export const dateKey = (value = new Date()) => {
  const offset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 10);
};

export const localDate = (key: string) => new Date(`${key}T12:00:00`);

export const dateFromOffset = (offset: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return dateKey(date);
};

export const uid = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const initialSettings = (): AppSettings => ({
  id: "preferences",
  theme: "system",
  weekStartsOn: 1,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  onboardingComplete: false,
  dashboardSections: ["today", "heatmap", "insight"],
});
