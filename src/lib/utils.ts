/** "+998 90 123-45-67", "901234567" → "+998901234567" (or null if invalid) */
export function normalizePhone(raw: string): string | null {
  const d = (raw || "").replace(/\D/g, "");
  const n = d.length === 9 ? "998" + d : d;
  return /^998\d{9}$/.test(n) ? "+" + n : null;
}

export function formatPhone(p: string) {
  const m = p.match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : p;
}

const MAP: Record<string, string> = { "ʻ": "", "‘": "", "’": "", "'": "", "`": "", "ʼ": "" };
export function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .replace(/[ʻ‘’'`ʼ]/g, (c) => MAP[c] ?? "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
const TZ = "Asia/Tashkent";
function parts(d: Date) {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(d);
  const g = (t: string) => f.find((x) => x.type === t)?.value ?? "";
  return { y: g("year"), m: +g("month"), d: g("day"), hh: g("hour"), mm: g("minute") };
}
export function fmtDate(d?: Date | null) {
  if (!d) return "";
  const p = parts(new Date(d));
  return `${+p.d}-${MONTHS[p.m - 1]}, ${p.y}`;
}
export function fmtDateTime(d?: Date | null) {
  if (!d) return "";
  const p = parts(new Date(d));
  return `${+p.d}-${MONTHS[p.m - 1]}, ${p.hh}:${p.mm}`;
}
export function fmtTime(d?: Date | null) {
  if (!d) return "";
  const p = parts(new Date(d));
  return `${p.hh}:${p.mm}`;
}
/** "2026-11-05T18:30" typed in Tashkent time → Date */
export function fromLocalInput(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v + ":00+05:00");
  return isNaN(+d) ? null : d;
}
export function toLocalInput(d?: Date | null) {
  if (!d) return "";
  const p = parts(new Date(d));
  return `${p.y}-${String(p.m).padStart(2, "0")}-${p.d.padStart(2, "0")}T${p.hh}:${p.mm}`;
}
export function toDateInput(d?: Date | null) {
  return d ? toLocalInput(d).slice(0, 10) : "";
}

export const roleLabel = { STUDENT: "Talaba", TEACHER: "O‘qituvchi", ADMIN: "Admin" } as const;
export const statusLabel = { PENDING: "Kutilmoqda", APPROVED: "Qabul qilindi", REJECTED: "Rad etildi" } as const;

export const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
export const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);
