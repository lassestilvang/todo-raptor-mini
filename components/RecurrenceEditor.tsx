import React from 'react';

export default function RecurrenceEditor({
  value,
  onChange,
}: {
  value?: any;
  onChange?: (v: any) => void;
}) {
  return (
    <div className="flex gap-2 items-center">
      <label className="text-sm">Recurrence</label>
      <select
        value={value?.type ?? 'none'}
        onChange={(e) => onChange?.({ type: e.target.value })}
        className="px-2 py-1 rounded bg-slate-800"
      >
        <option value="none">None</option>
        <option value="daily">Every day</option>
        <option value="weekly">Every week</option>
        <option value="weekday">Every weekday</option>
        <option value="monthly">Every month</option>
        <option value="yearly">Every year</option>
      </select>
    </div>
  );
}
