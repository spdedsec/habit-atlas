/**
 * Habit Atlas style reminder: creation is expressive but compact—advanced structure appears only when needed.
 */
import { useState } from "react";
import { Check, Plus, Sparkles } from "lucide-react";
import { db } from "@/lib/db";
import { categoryPalette, dateKey, type Habit, type MeasurementType, uid } from "@/lib/domain";

type Props = { onClose: () => void };

export function NewHabitDialog({ onClose }: Props) {
  const [name, setName] = useState("");
  const [measurement, setMeasurement] = useState<MeasurementType>("binary");
  const [target, setTarget] = useState(1);
  const [unit, setUnit] = useState("");
  const [category, setCategory] = useState(categoryPalette[0]);
  const [schedule, setSchedule] = useState<"daily" | "weekdays" | "weeklyTarget">("daily");
  const [frequency, setFrequency] = useState(3);
  const [saving, setSaving] = useState(false);

  const numeric = measurement !== "binary";
  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const now = new Date().toISOString();
    const habit: Habit = {
      id: uid(), name: name.trim(), icon: category.icon, color: category.color, category: category.name, tags: [], kind: "good", measurement,
      target: numeric ? Math.max(1, Number(target) || 1) : 1, unit: numeric ? unit.trim() || (measurement === "duration" ? "min" : "times") : undefined,
      schedule: schedule === "weeklyTarget" ? { kind: schedule, targetOccurrences: Math.max(1, frequency), startDate: dateKey() } : { kind: schedule, startDate: dateKey() },
      archived: false, createdAt: now, updatedAt: now,
    };
    await db.habits.add(habit);
    onClose();
  }
  return <div className="dialog-scrim" role="presentation" onMouseDown={onClose}>
    <section className="habit-dialog" role="dialog" aria-modal="true" aria-labelledby="habit-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
      <div className="dialog-heading"><div><p className="eyebrow">New mark</p><h2 id="habit-dialog-title">Create a habit</h2></div><button className="icon-button" onClick={onClose} aria-label="Close creation dialog">×</button></div>
      <form onSubmit={save} className="habit-form">
        <label className="field full"><span>What are you making room for?</span><input autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Read before bed" maxLength={80} /></label>
        <fieldset><legend>How do you record it?</legend><div className="choice-row">{(["binary", "count", "duration", "quantity", "percentage"] as MeasurementType[]).map((type) => <button type="button" key={type} className={measurement === type ? "choice active" : "choice"} onClick={() => setMeasurement(type)}>{type === "binary" ? "Once" : type}</button>)}</div></fieldset>
        {numeric && <div className="field-grid"><label className="field"><span>Target</span><input type="number" min="1" value={target} onChange={(event) => setTarget(Number(event.target.value))} /></label><label className="field"><span>Unit</span><input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder={measurement === "duration" ? "minutes" : "pages"} maxLength={20} /></label></div>}
        <fieldset><legend>Rhythm</legend><div className="choice-row">{([ ["daily", "Every day"], ["weekdays", "Weekdays"], ["weeklyTarget", "Weekly goal"] ] as const).map(([kind, label]) => <button type="button" key={kind} className={schedule === kind ? "choice active" : "choice"} onClick={() => setSchedule(kind)}>{label}</button>)}</div>{schedule === "weeklyTarget" && <label className="field inline-field"><span>Times per week</span><input type="number" min="1" max="7" value={frequency} onChange={(event) => setFrequency(Number(event.target.value))} /></label>}</fieldset>
        <fieldset><legend>Index color</legend><div className="category-picker">{categoryPalette.map((item) => <button type="button" title={item.name} key={item.name} onClick={() => setCategory(item)} className={category.name === item.name ? "category-dot selected" : "category-dot"} style={{ "--dot": item.color } as React.CSSProperties}><span>{item.icon}</span>{category.name === item.name && <Check size={14} />}</button>)}</div></fieldset>
        <div className="dialog-actions"><button type="button" className="text-button" onClick={onClose}>Not now</button><button className="primary-button" disabled={saving || !name.trim()}>{saving ? "Saving…" : <><Plus size={17} /> Add to today</>}</button></div>
        <p className="local-note"><Sparkles size={14} /> Stored only on this device. You can export it whenever you like.</p>
      </form>
    </section>
  </div>;
}
