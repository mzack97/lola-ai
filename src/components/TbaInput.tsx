"use client";
import { useState } from "react";

/** An input with an "E’lon qilinadi" (to be announced) switch. When on, the field is sent empty. */
export function TbaInput({ name, type = "text", defaultValue, placeholder, label, hint }: { name: string; type?: string; defaultValue?: string; placeholder?: string; label: string; hint?: string }) {
  const [tba, setTba] = useState(!defaultValue);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label !mb-0">{label}</span>
        <label className="flex cursor-pointer items-center gap-2 text-[11px] font-bold text-muted">
          <span>E’lon qilinadi</span>
          <span className={`relative h-5 w-9 rounded-full transition ${tba ? "bg-orange" : "bg-ink/15"}`}>
            <input type="checkbox" checked={tba} onChange={(e) => setTba(e.target.checked)} className="sr-only" />
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${tba ? "left-[18px]" : "left-0.5"}`} />
          </span>
        </label>
      </div>
      {tba ? (
        <div className="input flex items-center text-muted">⏳ E’lon qilinadi</div>
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} className="input" required />
      )}
      {hint && !tba && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
