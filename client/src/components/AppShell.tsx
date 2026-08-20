/**
 * Habit Atlas style reminder: this fieldbook shell emphasizes a clear daily loop and progressive disclosure.
 * Sidebar index tabs, ledger bands, and the contribution quilt replace generic dashboard cards.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Archive, BarChart3, BookOpenText, CalendarDays, Check, ChevronLeft, CircleHelp, Download, FileUp, Flame, Goal, Home, Info, Leaf, Menu, Moon, MoreHorizontal, Plus, Search, Settings2, ShieldCheck, Sparkles, Sun, Target, X } from "lucide-react";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { NewHabitDialog } from "./NewHabitDialog";
import { useHabitData } from "@/hooks/useHabitData";
import { clearAllLocalData, db } from "@/lib/db";
import { exportCsv, exportJson, importBackup, validateBackup } from "@/lib/backup";
import { categoryPalette, dateKey, dateFromOffset, localDate, uid } from "@/lib/domain";
import { calculateStats, completionProgress, dateRange, isDueToday } from "@/lib/habitEngine";
import { requestLocalReminderPermission } from "@/lib/notifications";
import { syncTodayWidget } from "@/lib/widget";
import { App as NativeApp } from "@capacitor/app";
import { cn } from "@/lib/utils";

type View = "home" | "habits" | "calendar" | "insights" | "goals" | "settings";

const primaryNav: Array<{ id: View; label: string; icon: typeof Home }> = [
  { id: "home", label: "Today", icon: Home },
  { id: "habits", label: "Habits", icon: BookOpenText },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "goals", label: "Goals", icon: Goal },
];

function BrandMark() {
  return <img className="brand-mark" src="/habit-atlas-logo.png" alt="" aria-hidden="true" />;
}

function formatToday() {
  return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric" }).format(new Date());
}

export default function AppShell() {
  const { habits, activeHabits, completions, routines, goals, settings, completionFor, setCompletion, toggleCompletion, archiveHabit } = useHabitData();
  const [view, setView] = useState<View>("home");
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [showMobileIndex, setShowMobileIndex] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateKey());
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
  const [measureHabitId, setMeasureHabitId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState(30);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const importRef = useRef<HTMLInputElement>(null);
  const today = dateKey();

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js");
  }, []);
  useEffect(() => {
    const theme = settings?.theme || "system";
    const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("atlas-dark", dark);
  }, [settings?.theme]);
  useEffect(() => { void syncTodayWidget(activeHabits, completions); }, [activeHabits, completions]);
  useEffect(() => {
    let removed = false;
    let listener: { remove: () => Promise<void> } | undefined;
    void NativeApp.addListener("appUrlOpen", ({ url }) => {
      const target = new URL(url);
      const isQuickComplete = target.protocol === "habitatlas:" && target.hostname === "habit" && target.pathname.endsWith("/complete");
      if (!isQuickComplete) return;
      const habitId = target.pathname.split("/").filter(Boolean)[0];
      const habit = activeHabits.find((item) => item.id === habitId);
      if (habit) { void toggleCompletion(habit); setView("home"); flash(`${habit.name} marked from your widget.`); }
    }).then((handle) => { if (removed) void handle.remove(); else listener = handle; });
    return () => { removed = true; if (listener) void listener.remove(); };
  }, [activeHabits, toggleCompletion]);

  const dueToday = useMemo(() => activeHabits.filter((habit) => isDueToday(habit, completions, today)), [activeHabits, completions, today]);
  const completedToday = dueToday.filter((habit) => {
    const entry = completionFor(habit.id, today);
    return entry && completionProgress(habit, entry.value, entry.status) >= 1;
  });
  const progress = dueToday.length ? Math.round((completedToday.length / dueToday.length) * 100) : 0;
  const allStats = useMemo(() => activeHabits.map((habit) => ({ habit, stats: calculateStats(habit, completions) })), [activeHabits, completions]);
  const selectedDayEntries = completions.filter((entry) => entry.date === selectedDate);

  function navigate(next: View) { setView(next); setShowMobileIndex(false); }
  function flash(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 3600); }
  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = validateBackup(JSON.parse(await file.text()));
      const replace = window.confirm("Choose OK to replace local data, or Cancel to merge this backup with your current data.");
      await importBackup(backup, replace ? "replace" : "merge");
      flash(replace ? "Backup restored on this device." : "Backup merged with your local record.");
    } catch (error) { flash(error instanceof Error ? error.message : "That backup could not be imported."); }
    event.target.value = "";
  }
  async function createStarter(name: string, categoryIndex: number) {
    const category = categoryPalette[categoryIndex];
    const now = new Date().toISOString();
    await db.habits.add({ id: uid(), name, icon: category.icon, color: category.color, category: category.name, tags: [], kind: "good", measurement: "binary", target: 1, schedule: { kind: "daily", startDate: today }, archived: false, createdAt: now, updatedAt: now });
  }
  async function addGoal(event: React.FormEvent) {
    event.preventDefault();
    if (!newGoalName.trim()) return;
    const now = new Date().toISOString();
    await db.goals.add({ id: uid(), name: newGoalName.trim(), target: Math.max(1, newGoalTarget), unit: "marks", createdAt: now, updatedAt: now });
    setNewGoalName(""); setNewGoalTarget(30); flash("Goal added to your atlas.");
  }
  async function setTheme(theme: "light" | "dark" | "system") {
    if (!settings) return;
    await db.settings.put({ ...settings, theme });
  }

  const heading = { home: "Today", habits: "Habit index", calendar: "Calendar", insights: "Patterns", goals: "Goals", settings: "Settings" }[view];
  return <div className="atlas-app">
    <aside className={cn("atlas-sidebar", showMobileIndex && "open")}>
      <div className="sidebar-top"><button className="brand-lockup" onClick={() => navigate("home")} aria-label="Go to today"><BrandMark /><span><b>Habit</b> Atlas</span></button><button className="sidebar-close icon-button" onClick={() => setShowMobileIndex(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <nav aria-label="Primary navigation" className="main-index">{primaryNav.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={cn("index-item", view === item.id && "active")}><Icon size={19} /><span>{item.label}</span>{item.id === "home" && dueToday.length > 0 && <b>{dueToday.length}</b>}</button>; })}</nav>
      <div className="sidebar-rule" />
      <div className="secondary-index"><span className="index-caption">Your data</span><button onClick={() => navigate("settings")}><ShieldCheck size={17} /> Privacy center</button><button onClick={() => navigate("settings")}><Download size={17} /> Backup & export</button><button onClick={() => flash("Local search is being added to the next fieldbook edition.")}><Search size={17} /> Search</button></div>
      <div className="sidebar-foot"><div className="privacy-badge"><ShieldCheck size={17} /><span><b>Private by default</b><small>Stored on this device</small></span></div><button className="quiet-add" onClick={() => setShowNewHabit(true)}><Plus size={17} /> New habit</button></div>
    </aside>
    <main className="atlas-main">
      <header className="app-header"><button className="mobile-menu icon-button" onClick={() => setShowMobileIndex(true)} aria-label="Open navigation"><Menu size={21} /></button><div><p className="eyebrow">{view === "home" ? formatToday() : "Habit Atlas"}</p><h1>{heading}</h1></div><div className="header-actions"><button className="header-create primary-button" onClick={() => setShowNewHabit(true)}><Plus size={17} /> <span>New habit</span></button><button className="icon-button" onClick={() => navigate("settings")} aria-label="Open settings"><Settings2 size={20} /></button></div></header>
      {notice && <div className="app-notice" role="status"><Check size={16} /> {notice}</div>}
      {view === "home" && <HomeView dueToday={dueToday} progress={progress} completions={completions} completionFor={completionFor} toggleCompletion={toggleCompletion} setCompletion={setCompletion} measureHabitId={measureHabitId} setMeasureHabitId={setMeasureHabitId} activeHabits={activeHabits} selectedDate={selectedDate} setSelectedDate={setSelectedDate} heatmapYear={heatmapYear} setHeatmapYear={setHeatmapYear} completedToday={completedToday.length} onNewHabit={() => setShowNewHabit(true)} onStarter={createStarter} />}
      {view === "habits" && <HabitsView habits={habits} stats={allStats} onArchive={archiveHabit} onCreate={() => setShowNewHabit(true)} />}
      {view === "calendar" && <CalendarView activeHabits={activeHabits} completions={completions} date={selectedDate} onDate={setSelectedDate} month={calendarMonth} onMonth={setCalendarMonth} entries={selectedDayEntries} />}
      {view === "insights" && <InsightsView stats={allStats} habits={activeHabits} completions={completions} />}
      {view === "goals" && <GoalsView goals={goals} habits={activeHabits} completions={completions} onAdd={addGoal} name={newGoalName} setName={setNewGoalName} target={newGoalTarget} setTarget={setNewGoalTarget} />}
      {view === "settings" && <SettingsView settings={settings} onTheme={setTheme} onExportJson={() => void exportJson().then(() => flash("Portable JSON backup downloaded."))} onExportCsv={() => void exportCsv().then(() => flash("CSV history downloaded."))} onImport={() => importRef.current?.click()} onNotifications={() => void requestLocalReminderPermission().then((result) => { const granted = typeof result === "string" ? result === "granted" : "display" in result && result.display === "granted"; flash(granted ? "Local notification permission enabled." : "Notifications remain off. You can change this in device settings."); })} onClear={() => { if (window.confirm("Permanently remove all local Habit Atlas data from this browser? Export a backup first if you need it.")) void clearAllLocalData().then(() => flash("Local data cleared.")); }} />}
    </main>
    <nav className="mobile-tabbar" aria-label="Mobile navigation">{primaryNav.slice(0, 5).map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={view === item.id ? "active" : ""}><Icon size={20} /><span>{item.label}</span></button>; })}</nav>
    <input ref={importRef} className="visually-hidden" type="file" accept="application/json,.json" onChange={handleImport} />
    {showNewHabit && <NewHabitDialog onClose={() => setShowNewHabit(false)} />}
  </div>;
}

type HomeProps = Pick<ReturnType<typeof useHabitData>, "completions" | "completionFor" | "toggleCompletion" | "setCompletion" | "activeHabits"> & { dueToday: ReturnType<typeof useHabitData>["activeHabits"]; progress: number; completedToday: number; measureHabitId: string | null; setMeasureHabitId: (id: string | null) => void; selectedDate: string; setSelectedDate: (date: string) => void; heatmapYear: number; setHeatmapYear: (year: number) => void; onNewHabit: () => void; onStarter: (name: string, category: number) => Promise<void> };
function HomeView({ dueToday, progress, completions, completionFor, toggleCompletion, setCompletion, measureHabitId, setMeasureHabitId, activeHabits, selectedDate, setSelectedDate, heatmapYear, setHeatmapYear, completedToday, onNewHabit, onStarter }: HomeProps) {
  if (!activeHabits.length) return <section className="first-record"><div className="first-record-copy"><p className="eyebrow">Your first page</p><h2>Nothing here yet.<br /><em>Your first dot is waiting.</em></h2><p>Habit Atlas lives on this device, not in a cloud profile. Start with one small rhythm and make a record you can keep.</p><div className="starter-actions"><button className="primary-button" onClick={onNewHabit}><Plus size={18} /> Create a habit</button><button className="text-button" onClick={() => void onStarter("Drink water", 2)}>Try “Drink water”</button></div><div className="starter-chips"><span>or make a quick start:</span><button onClick={() => void onStarter("Read before bed", 0)}>Read</button><button onClick={() => void onStarter("Move for a minute", 1)}>Move</button><button onClick={() => void onStarter("Message someone", 4)}>Connect</button></div></div><div className="first-record-art"><img src="/manus-storage/habit-atlas-empty-state_59e5167b.png" alt="Abstract atlas made from contribution cells" /><span className="ledger-stamp">Local record · no account</span></div></section>;
  return <div className="home-layout"><section className="daily-section"><div className="daily-intro"><div><p className="eyebrow">Daily ledger</p><h2>Make your mark.</h2><p>{dueToday.length ? "Small effort, clearly seen." : "Your scheduled habits are complete for now."}</p></div><div className="progress-orbit" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}><b>{progress}%</b><small>{completedToday}/{dueToday.length}</small></div></div><div className="habit-list">{dueToday.length ? dueToday.map((habit) => { const entry = completionFor(habit.id); const completed = Boolean(entry && completionProgress(habit, entry.value, entry.status) >= 1); const measuring = measureHabitId === habit.id; return <article className={cn("habit-row", completed && "completed")} key={habit.id}><button className="completion-dot" style={{ "--habit": habit.color } as React.CSSProperties} onClick={() => void toggleCompletion(habit)} aria-label={`${completed ? "Undo" : "Complete"} ${habit.name}`}><Check size={18} /></button><div className="habit-identity"><span className="habit-icon" style={{ backgroundColor: `${habit.color}1A`, color: habit.color }}>{habit.icon}</span><div><h3>{habit.name}</h3><p><i style={{ backgroundColor: habit.color }} /> {habit.category} · {habit.measurement === "binary" ? "once" : `${entry?.value || 0} / ${habit.target} ${habit.unit || ""}`}</p></div></div>{habit.measurement !== "binary" && <button className="value-pill" onClick={() => setMeasureHabitId(measuring ? null : habit.id)}>{entry?.value || 0}<span>{habit.unit}</span></button>}<span className="habit-status">{completed ? "Done" : entry?.status === "partial" ? "In progress" : "Open"}</span>{measuring && <div className="measure-strip"><button onClick={() => void setCompletion(habit, Math.max(0, (entry?.value || 0) - Math.max(1, Math.round(habit.target / 4))))}>−</button><strong>{entry?.value || 0} {habit.unit}</strong><button onClick={() => void setCompletion(habit, (entry?.value || 0) + Math.max(1, Math.round(habit.target / 4)))}>+</button><button className="measure-done" onClick={() => setMeasureHabitId(null)}>Done</button></div>}</article>; }) : <div className="all-clear"><Leaf size={24} /><div><b>Today is clear.</b><p>Your active habits are not scheduled for this date.</p></div></div>}</div></section><aside className="today-aside"><div className="consistency-note"><p className="eyebrow">Consistency</p><strong>{progress === 100 ? "A fully marked day." : progress ? "The page is taking shape." : "Today has room for one good mark."}</strong><span>{progress === 100 ? "Pause when you are ready." : "No pressure. One action changes the record."}</span></div><div className="aside-rule" /><p className="mini-label">Today’s palette</p><div className="category-key">{Array.from(new Set(dueToday.map((habit) => habit.category))).map((category) => { const habit = dueToday.find((item) => item.category === category); return <span key={category}><i style={{ backgroundColor: habit?.color }} />{category}</span>; })}</div></aside><div className="heatmap-full"><ContributionHeatmap habits={activeHabits} completions={completions} year={heatmapYear} onYearChange={setHeatmapYear} onSelectDate={setSelectedDate} /></div><section className="selected-day-strip"><div><p className="eyebrow">Selected day</p><h3>{localDate(selectedDate).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3></div><p>{selectedDate === dateKey() ? "Tap a heatmap cell to revisit any day in your record." : `${completions.filter((entry) => entry.date === selectedDate).length} recorded marks. Historical edits stay local.`}</p></section></div>;
}

function HabitsView({ habits, stats, onArchive, onCreate }: { habits: ReturnType<typeof useHabitData>["habits"]; stats: { habit: ReturnType<typeof useHabitData>["activeHabits"][number]; stats: ReturnType<typeof calculateStats> }[]; onArchive: (habit: ReturnType<typeof useHabitData>["habits"][number]) => Promise<void>; onCreate: () => void }) {
  return <div className="content-page"><section className="page-hero"><div><p className="eyebrow">The full index</p><h2>Habits are records, not chores.</h2><p>Archive a rhythm when its season changes; its history remains part of the atlas.</p></div><button className="primary-button" onClick={onCreate}><Plus size={17} /> Add habit</button></section>{habits.length ? <section className="index-table">{habits.map((habit) => { const record = stats.find((item) => item.habit.id === habit.id); return <article key={habit.id} className={cn("habit-index-row", habit.archived && "archived")}><span className="habit-icon" style={{ backgroundColor: `${habit.color}1A`, color: habit.color }}>{habit.icon}</span><div className="habit-index-name"><h3>{habit.name}</h3><p><i style={{ backgroundColor: habit.color }} /> {habit.category} · {habit.measurement === "binary" ? "Once" : `${habit.target} ${habit.unit || "units"}`} · {habit.schedule.kind === "daily" ? "Daily" : habit.schedule.kind === "weekdays" ? "Weekdays" : habit.schedule.kind === "weeklyTarget" ? `${habit.schedule.targetOccurrences}× weekly` : habit.schedule.kind}</p></div><div className="index-metric"><b>{record?.stats.currentStreak || 0}</b><span>current streak</span></div><div className="index-metric"><b>{record?.stats.completionRate || 0}%</b><span>consistency</span></div><button className="archive-button" onClick={() => void onArchive(habit)}><Archive size={16} /> {habit.archived ? "Restore" : "Archive"}</button></article>; })}</section> : <EmptyCard text="Your habit index is blank." button="Create a first habit" onClick={onCreate} />}</div>;
}

function CalendarView({ activeHabits, completions, date, onDate, month, onMonth, entries }: { activeHabits: ReturnType<typeof useHabitData>["activeHabits"]; completions: ReturnType<typeof useHabitData>["completions"]; date: string; onDate: (date: string) => void; month: Date; onMonth: (date: Date) => void; entries: ReturnType<typeof useHabitData>["completions"] }) {
  const days = useMemo(() => { const start = new Date(month); start.setDate(1 - start.getDay()); return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day; }); }, [month]);
  const caption = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return <div className="content-page calendar-page"><section className="calendar-header"><div><p className="eyebrow">Daily detail</p><h2>{caption}</h2></div><div className="month-controls"><button onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><button onClick={() => onMonth(new Date())}>Today</button><button onClick={() => onMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div></section><div className="calendar-layout"><section className="month-grid"><div className="weekday-row">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-days">{days.map((day) => { const key = dateKey(day); const records = completions.filter((entry) => entry.date === key); const isMonth = day.getMonth() === month.getMonth(); return <button key={key} onClick={() => onDate(key)} className={cn("calendar-cell", !isMonth && "outside", key === date && "selected", key === dateKey() && "today")}><span>{day.getDate()}</span><i className={`calendar-activity activity-${Math.min(4, records.length)}`} /><small>{records.length ? `${records.length} mark${records.length === 1 ? "" : "s"}` : ""}</small></button>; })}</div></section><aside className="day-detail"><p className="eyebrow">{date === dateKey() ? "Today" : "Historical entry"}</p><h3>{localDate(date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</h3><div className="day-summary"><b>{entries.length}</b><span>recorded mark{entries.length === 1 ? "" : "s"}</span></div>{activeHabits.filter((habit) => isDueToday(habit, completions, date)).slice(0, 5).map((habit) => { const entry = entries.find((item) => item.habitId === habit.id); return <div className="day-habit" key={habit.id}><i style={{ backgroundColor: habit.color }} /><span>{habit.name}</span><b>{entry ? entry.status === "completed" ? "Done" : entry.status : "—"}</b></div>; })}<p className="day-note"><Info size={15} /> Select a day to inspect the local record. Calendar edits are retained rather than discarded.</p></aside></div></div>;
}

function InsightsView({ stats, habits, completions }: { stats: { habit: ReturnType<typeof useHabitData>["activeHabits"][number]; stats: ReturnType<typeof calculateStats> }[]; habits: ReturnType<typeof useHabitData>["activeHabits"]; completions: ReturnType<typeof useHabitData>["completions"] }) {
  if (!habits.length) return <div className="content-page"><EmptyCard text="Keep tracking. Patterns will appear here." button="Return to today" onClick={() => undefined} art /></div>;
  const top = [...stats].sort((a, b) => b.stats.completionRate - a.stats.completionRate)[0];
  const total = stats.reduce((sum, item) => sum + item.stats.totalCompletions, 0);
  const week = dateRange(7); const monthly = dateRange(30);
  const score = Math.round((completions.filter((item) => week.includes(item.date) && item.status === "completed").length / Math.max(1, habits.length * 7)) * 100);
  return <div className="content-page insights-page"><section className="insight-hero"><div><p className="eyebrow">Calculated on-device</p><h2>Your patterns, plainly stated.</h2><p>Habit Atlas only reads the record stored in this browser. It does not send your behavior elsewhere.</p></div><img src="/manus-storage/habit-atlas-analytics-atmosphere_587fa1e5.jpg" alt="Abstract editorial data field" /></section><div className="insight-metrics"><Metric label="Active habits" value={habits.length} accent="blue" /><Metric label="Marks in record" value={total} accent="green" /><Metric label="This week" value={`${score}%`} accent="ochre" /><Metric label="Current best" value={`${top?.stats.currentStreak || 0}d`} accent="coral" /></div><section className="insight-ledger"><div className="ledger-heading"><div><p className="eyebrow">Habit reading</p><h3>What the record suggests</h3></div><span>{monthly.length} days considered</span></div><div className="insight-lines">{stats.sort((a, b) => b.stats.completionRate - a.stats.completionRate).slice(0, 4).map(({ habit, stats: record }) => <article key={habit.id}><span className="habit-icon small" style={{ backgroundColor: `${habit.color}1A`, color: habit.color }}>{habit.icon}</span><div><h4>{habit.name}</h4><p>{record.completionRate >= 75 ? `This rhythm held on ${record.completionRate}% of scheduled days.` : record.completionRate >= 35 ? `A working pattern is forming: ${record.completionRate}% of scheduled days were completed.` : `This record has ${record.completionRate}% completion so far. The next mark still counts.`}</p></div><b>{record.bestStreak}d<span>best run</span></b></article>)}</div></section></div>;
}

function GoalsView({ goals, habits, completions, onAdd, name, setName, target, setTarget }: { goals: ReturnType<typeof useHabitData>["goals"]; habits: ReturnType<typeof useHabitData>["activeHabits"]; completions: ReturnType<typeof useHabitData>["completions"]; onAdd: (event: React.FormEvent) => Promise<void>; name: string; setName: (value: string) => void; target: number; setTarget: (value: number) => void }) {
  return <div className="content-page goals-page"><section className="page-hero"><div><p className="eyebrow">Direction, not pressure</p><h2>Give your consistency somewhere to go.</h2><p>Goals are separate from daily habits so you can see the larger arc without crowding today.</p></div></section><div className="goal-layout"><section className="goals-list">{goals.length ? goals.map((goal) => { const current = goal.habitId ? completions.filter((entry) => entry.habitId === goal.habitId && entry.status === "completed").length : Math.min(goal.target, completions.filter((entry) => entry.status === "completed").length); const ratio = Math.min(100, Math.round((current / goal.target) * 100)); return <article className="goal-row" key={goal.id}><span className="goal-mark"><Target size={21} /></span><div><h3>{goal.name}</h3><p>{current} of {goal.target} {goal.unit}</p><div className="goal-progress"><i style={{ width: `${ratio}%` }} /></div></div><b>{ratio}%</b></article>; }) : <div className="goal-empty"><Target size={30} /><h3>No goals yet.</h3><p>Set an amount or a milestone to give the record a longer horizon.</p></div>}</section><form className="goal-form" onSubmit={(event) => void onAdd(event)}><p className="eyebrow">New goal</p><h3>Make the horizon visible.</h3><label className="field"><span>Goal title</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. 30 reading sessions" /></label><label className="field"><span>Target marks</span><input min="1" type="number" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label><button className="primary-button" disabled={!name.trim()}><Plus size={17} /> Add goal</button><p>Goals count local completion marks. Link a specific habit in the next edition.</p></form></div></div>;
}

function SettingsView({ settings, onTheme, onExportJson, onExportCsv, onImport, onNotifications, onClear }: { settings: ReturnType<typeof useHabitData>["settings"]; onTheme: (theme: "light" | "dark" | "system") => Promise<void>; onExportJson: () => void; onExportCsv: () => void; onImport: () => void; onNotifications: () => void; onClear: () => void }) {
  return <div className="content-page settings-page"><section className="settings-lead"><p className="eyebrow">Your device, your record</p><h2>Privacy is a product feature.</h2><p>Habit Atlas runs without an account. Your habits, history, goals, and settings are held in this browser’s local database until you export or clear them.</p></section><div className="settings-grid"><section className="settings-panel"><h3><Sun size={19} /> Appearance</h3><p>Choose a surface that stays readable in your environment.</p><div className="theme-options">{(["light", "dark", "system"] as const).map((theme) => <button key={theme} onClick={() => void onTheme(theme)} className={settings?.theme === theme ? "active" : ""}>{theme === "light" ? <Sun size={18} /> : theme === "dark" ? <Moon size={18} /> : <MoreHorizontal size={18} />}<span>{theme}</span></button>)}</div></section><section className="settings-panel"><h3><Download size={19} /> Data ownership</h3><p>Backups are portable JSON files. CSV provides a readable history for your own analysis.</p><div className="settings-actions"><button onClick={onExportJson}><Download size={17} /> Backup JSON</button><button onClick={onExportCsv}><Download size={17} /> Export CSV</button><button onClick={onImport}><FileUp size={17} /> Import backup</button></div></section><section className="settings-panel"><h3><Sparkles size={19} /> Reminders</h3><p>Permission is opt-in. Android reminders are scheduled on-device; no reminder service receives your habit data.</p><button className="outline-button" onClick={onNotifications}>Enable local notifications</button></section><section className="settings-panel privacy-panel"><h3><ShieldCheck size={19} /> Privacy center</h3><dl><div><dt>Habit database</dt><dd>IndexedDB on this device</dd></div><div><dt>Account</dt><dd>Not required</dd></div><div><dt>Network use</dt><dd>No habit sync or tracking</dd></div><div><dt>Data control</dt><dd>Export, restore, or clear locally</dd></div></dl><button className="danger-link" onClick={onClear}>Clear all local data</button></section></div><section className="about-strip"><BrandMark /><div><b>Habit Atlas</b><span>v0.1.0 · local-first fieldbook</span></div><a href="https://github.com/iSoron/uhabits" target="_blank" rel="noreferrer">Why offline matters <CircleHelp size={14} /></a></section></div>;
}

function Metric({ label, value, accent }: { label: string; value: string | number; accent: string }) { return <article className={`metric-card ${accent}`}><span>{label}</span><b>{value}</b></article>; }
function EmptyCard({ text, button, onClick, art }: { text: string; button: string; onClick: () => void; art?: boolean }) { return <section className="empty-card">{art ? <img src="/manus-storage/habit-atlas-empty-state_59e5167b.png" alt="Abstract contribution atlas" /> : <Sparkles size={33} />}<div><h3>{text}</h3><p>There is no fabricated activity here. Your actual record will shape this view.</p><button className="primary-button" onClick={onClick}>{button}</button></div></section>; }
