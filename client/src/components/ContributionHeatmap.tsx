/**
 * Habit Atlas style reminder: the contribution quilt is a living, touchable record—not a generic chart.
 * Its modest cells use accessible labels and a local intensity algorithm for real measurements.
 */
import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { dateKey, localDate, type Habit, type HabitCompletion } from "@/lib/domain";
import { aggregateIntensity, intensityFor } from "@/lib/habitEngine";

type Props = {
  habits: Habit[];
  completions: HabitCompletion[];
  selectedHabitId?: string | "all";
  year: number;
  onYearChange: (year: number) => void;
  onSelectDate: (date: string) => void;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function daysInYear(year: number) {
  const start = new Date(year, 0, 1, 12);
  const end = new Date(year, 11, 31, 12);
  const paddedStart = new Date(start);
  paddedStart.setDate(start.getDate() - start.getDay());
  const paddedEnd = new Date(end);
  paddedEnd.setDate(end.getDate() + (6 - end.getDay()));
  const days: Date[] = [];
  for (let date = new Date(paddedStart); date <= paddedEnd; date.setDate(date.getDate() + 1)) days.push(new Date(date));
  return days;
}

export function ContributionHeatmap({ habits, completions, selectedHabitId = "all", year, onYearChange, onSelectDate }: Props) {
  const days = useMemo(() => daysInYear(year), [year]);
  const selected = selectedHabitId === "all" ? undefined : habits.find((habit) => habit.id === selectedHabitId);
  const monthPositions = useMemo(() => days.reduce<{ label: string; column: number }[]>((items, date, index) => {
    if (date.getDate() === 1 && (index === 0 || days[index - 1]?.getMonth() !== date.getMonth())) items.push({ label: monthNames[date.getMonth()], column: Math.floor(index / 7) + 1 });
    return items;
  }, []), [days]);
  const currentDate = dateKey();

  return (
    <section className="heatmap-panel" aria-label={`${year} contribution history`}>
      <div className="heatmap-toolbar">
        <div>
          <p className="eyebrow">Contribution quilt</p>
          <h2>{selected ? selected.name : "All habits"}</h2>
        </div>
        <div className="heatmap-year-controls" aria-label="Change history year">
          <button aria-label="Previous year" onClick={() => onYearChange(year - 1)}><ChevronLeft size={17} /></button>
          <span>{year}</span>
          <button aria-label="Next year" disabled={year >= new Date().getFullYear()} onClick={() => onYearChange(year + 1)}><ChevronRight size={17} /></button>
        </div>
      </div>
      <div className="heatmap-scroll">
        <div className="heatmap-wrap">
          <div className="heatmap-weekdays" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
          <div className="heatmap-grid-area">
            <div className="heatmap-months" aria-hidden="true">
              {monthPositions.map((month) => <span key={`${month.label}-${month.column}`} style={{ gridColumnStart: month.column }}>{month.label}</span>)}
            </div>
            <div className="heatmap-grid">
              {days.map((day) => {
                const key = dateKey(day);
                const inYear = day.getFullYear() === year;
                const entry = selected ? completions.find((record) => record.habitId === selected.id && record.date === key) : undefined;
                const intensity = selected ? intensityFor(selected, entry?.value || 0, entry?.status) : aggregateIntensity(habits, completions, key);
                const dateLabel = localDate(key).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric", year: "numeric" });
                return <button key={key} className={`heat-cell level-${inYear ? intensity : 0} ${key === currentDate ? "is-today" : ""} ${!inYear ? "outside-year" : ""}`} style={{ gridColumn: Math.floor(days.indexOf(day) / 7) + 1, gridRow: (day.getDay() + 6) % 7 + 1 }} onClick={() => inYear && onSelectDate(key)} disabled={!inYear} aria-label={`${dateLabel}: ${intensity === 0 ? "no activity" : `activity level ${intensity} of 4`}`} />;
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="heatmap-foot"><span>Less</span>{[0, 1, 2, 3, 4].map((level) => <i className={`heat-cell level-${level}`} key={level} />)}<span>More</span><span className="heatmap-foot-note">Tap any day to inspect the mark.</span></div>
    </section>
  );
}
