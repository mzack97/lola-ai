import { asc, eq } from "drizzle-orm";
import { db, users, type Course } from "@/db";
import { listCategories } from "@/lib/queries";
import { saveCourse } from "@/app/actions/admin";
import { Check, Field } from "./AdminUi";
import { toDateInput } from "@/lib/utils";

export async function CourseForm({ c, teacherIds = [] }: { c?: Course; teacherIds?: string[] }) {
  const [cats, teachers] = await Promise.all([
    listCategories(),
    db.select().from(users).where(eq(users.role, "TEACHER")).orderBy(asc(users.firstName)),
  ]);
  return (
    <form action={saveCourse} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      {c && <input type="hidden" name="id" value={c.id} />}
      <div className="card space-y-4 p-6">
        <Field label="Kurs nomi"><input name="title" required defaultValue={c?.title} className="input" /></Field>
        {c && <Field label="Manzil (slug)" hint={`lola-ai.uz/kurslar/${c.slug}`}><input name="slug" defaultValue={c.slug} className="input font-mono" /></Field>}
        <Field label="Qisqa tavsif" hint="Kurs kartasida ko‘rinadi (1–2 gap)"><input name="summary" defaultValue={c?.summary} className="input" /></Field>
        <Field label="To‘liq tavsif" hint="Kimlar uchun, nimani o‘rganadi, natija"><textarea name="description" rows={10} defaultValue={c?.description} className="input" /></Field>
        <Field label="Muqova rasmi (JPG/PNG, 16:9)"><input name="cover" type="file" accept="image/*" className="input py-2" /></Field>
        {c?.coverUrl && (<div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.coverUrl} alt="" className="h-20 rounded-lg" /><Check name="removeCover" label="Rasmni olib tashlash" /></div>)}
      </div>
      <div className="space-y-6">
        <div className="card space-y-4 p-6">
          <Field label="Yo‘nalish">
            <select name="categoryId" defaultValue={c?.categoryId ?? ""} className="input"><option value="">—</option>{cats.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
          </Field>
          <Field label="Format"><input name="format" defaultValue={c?.format ?? "Onlayn · Google Meet"} className="input" /></Field>
          <Field label="Jadval" hint="Masalan: Du, Cho, Ju · 18:00"><input name="schedule" defaultValue={c?.schedule} className="input" /></Field>
          <Field label="Boshlanish sanasi"><input name="startDate" type="date" defaultValue={toDateInput(c?.startDate)} className="input" /></Field>
          <Field label="Guruh sig‘imi"><input name="capacity" type="number" min={1} defaultValue={c?.capacity ?? 30} className="input" /></Field>
          <Check name="autoApprove" label="Arizalarni avtomatik qabul qilish" defaultChecked={c?.autoApprove} />
          <Check name="published" label="Saytda nashr etish" defaultChecked={c?.published} />
        </div>
        <div className="card p-6">
          <div className="label">Ustoz(lar)</div>
          {teachers.length === 0 ? <p className="text-sm text-muted">Avval «Foydalanuvchilar» bo‘limida O‘qituvchi rolida hisob yarating.</p> : (
            <div className="max-h-60 space-y-2 overflow-y-auto">
              {teachers.map((t) => (
                <label key={t.id} className="flex items-center gap-2 text-sm font-semibold">
                  <input type="checkbox" name="teacherIds" value={t.id} defaultChecked={teacherIds.includes(t.id)} className="h-4 w-4 accent-orange" />
                  {t.firstName} {t.lastName}
                </label>
              ))}
            </div>
          )}
        </div>
        <button className="btn-primary w-full py-3">Saqlash</button>
      </div>
    </form>
  );
}
