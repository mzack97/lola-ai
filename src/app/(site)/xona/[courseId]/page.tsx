import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, asc, desc, eq, gte } from "drizzle-orm";
import { db, courses, lessons, materials, sections } from "@/db";
import { requireUser } from "@/lib/auth";
import { courseAccess } from "@/lib/queries";
import { fmtDateTime } from "@/lib/utils";
import { Chat } from "@/components/Chat";
import { addMaterial, addSection, announceLesson, deleteLesson, deleteMaterial, deleteSection, moveSection, updateSection } from "@/app/actions/room";

export const metadata = { title: "Kurs xonasi" };

const ERR: Record<string, string> = {
  "err-lesson": "Dars sanasi va Google Meet havolasini to‘g‘ri kiriting (https://meet.google.com/...).",
  "err-material": "Material nomi va havola (https://...) yoki fayl kerak.",
  "err-file": "Fayl yuklanmadi: turi yoki hajmi mos emas (maksimum 50 MB).",
};

export default async function Room({ params, searchParams }: { params: Promise<{ courseId: string }>; searchParams: Promise<{ b?: string; t?: string }> }) {
  const user = await requireUser();
  const { courseId } = await params;
  const { b, t } = await searchParams;
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) notFound();
  const access = await courseAccess(user.id, user.role, courseId);
  if (!access) redirect(`/kurslar/${course.slug}`);
  const manage = access !== "student";

  const all = await db.select().from(sections).where(eq(sections.courseId, courseId)).orderBy(asc(sections.order), asc(sections.createdAt));
  const list = manage ? all : all.filter((s) => s.visible);
  const current = list.find((s) => s.id === b) ?? list[0];
  const tab = t === "materiallar" || t === "darslar" ? t : "chat";
  const err = t && ERR[t];

  const [upcoming, pastLessons, mats] = current
    ? await Promise.all([
        db.select().from(lessons).where(and(eq(lessons.sectionId, current.id), gte(lessons.startsAt, new Date(Date.now() - 3 * 3600e3)))).orderBy(asc(lessons.startsAt)),
        db.select().from(lessons).where(eq(lessons.sectionId, current.id)).orderBy(desc(lessons.startsAt)),
        db.select().from(materials).where(eq(materials.sectionId, current.id)).orderBy(desc(materials.createdAt)),
      ])
    : [[], [], []];

  const tabLink = (k: string) => `/xona/${courseId}?b=${current?.id}${k === "chat" ? "" : `&t=${k}`}`;

  return (
    <div className="container-x py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href={manage ? (user.role === "ADMIN" ? "/admin/kurslar" : "/oqituvchi") : "/kabinet"} className="text-sm font-semibold text-muted hover:text-orange">← Orqaga</Link>
          <div className="kicker mt-4">Kurs xonasi {manage && "· boshqaruv rejimi"}</div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">{course.title}</h1>
          {course.schedule && <p className="mt-1 text-sm text-muted">{course.schedule}</p>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* ---- sections (curriculum) ---- */}
        <aside className="space-y-3">
          <div className="card p-3">
            <div className="px-2 pb-2 pt-1 text-xs font-bold uppercase tracking-wider text-muted">O‘quv reja</div>
            {list.length === 0 && <p className="px-2 pb-2 text-sm text-muted">{manage ? "Birinchi bo‘limni qo‘shing." : "Ustoz hali bo‘lim qo‘shmagan."}</p>}
            <ol className="space-y-1">
              {list.map((s, i) => (
                <li key={s.id}>
                  <Link href={`/xona/${courseId}?b=${s.id}`}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${current?.id === s.id ? "bg-ink text-white" : "hover:bg-paper"} ${!s.visible ? "opacity-50" : ""}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] ${current?.id === s.id ? "bg-orange text-white" : "bg-[#f3efeb]"}`}>{i + 1}</span>
                    <span className="truncate">{s.title}</span>
                    {!s.visible && <span className="ml-auto text-[10px]">yashirin</span>}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          {manage && (
            <form action={addSection} className="card space-y-2 p-3">
              <input type="hidden" name="courseId" value={courseId} />
              <input name="title" required placeholder="Masalan: 1-hafta: Kirish" className="input" />
              <button className="btn-dark btn-sm w-full">+ Bo‘lim qo‘shish</button>
            </form>
          )}
        </aside>

        {/* ---- current section ---- */}
        <section className="min-w-0 space-y-5">
          {!current ? (
            <div className="card border-dashed p-16 text-center text-muted">{manage ? "Chap tomondan birinchi bo‘limni qo‘shing — har bir bo‘limda chat, darslar va materiallar bo‘ladi." : "Kurs materiallari tez orada qo‘shiladi."}</div>
          ) : (
            <>
              {err && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</div>}

              {manage && (
                <details className="card p-4">
                  <summary className="cursor-pointer text-sm font-bold">⚙ Bo‘lim sozlamalari</summary>
                  <div className="mt-4 flex flex-wrap items-end gap-3">
                    <form action={updateSection} className="flex flex-1 flex-wrap items-end gap-3">
                      <input type="hidden" name="sectionId" value={current.id} />
                      <div className="min-w-[220px] flex-1"><label className="label">Nomi</label><input name="title" defaultValue={current.title} className="input" /></div>
                      <label className="flex items-center gap-2 pb-2.5 text-sm font-semibold"><input type="checkbox" name="visible" defaultChecked={current.visible} className="h-4 w-4 accent-orange" /> Talabalarga ko‘rinadi</label>
                      <button className="btn-dark btn-sm mb-1.5">Saqlash</button>
                    </form>
                    <form action={moveSection}><input type="hidden" name="sectionId" value={current.id} /><input type="hidden" name="dir" value="up" /><button className="btn-ghost btn-sm mb-1.5">↑</button></form>
                    <form action={moveSection}><input type="hidden" name="sectionId" value={current.id} /><input type="hidden" name="dir" value="down" /><button className="btn-ghost btn-sm mb-1.5">↓</button></form>
                    <form action={deleteSection}><input type="hidden" name="sectionId" value={current.id} /><button className="btn-danger btn-sm mb-1.5">O‘chirish</button></form>
                  </div>
                </details>
              )}

              {/* upcoming lessons = pinned Meet cards */}
              {upcoming.map((l) => (
                <div key={l.id} className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white">
                  <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-orange/30 blur-2xl" />
                  <div className="relative flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs font-bold uppercase tracking-widest text-orange">Navbatdagi dars</div>
                      <div className="mt-1 text-xl font-extrabold">{l.title}</div>
                      <div className="mt-1 text-sm text-white/70">🕒 {fmtDateTime(l.startsAt)} (Toshkent vaqti)</div>
                    </div>
                    <a href={l.meetUrl} target="_blank" rel="noreferrer" className="btn-primary px-6 py-3 text-base">▶ Darsga qo‘shilish</a>
                  </div>
                </div>
              ))}

              {manage && (
                <details className="card p-4" open={upcoming.length === 0}>
                  <summary className="cursor-pointer text-sm font-bold">📅 Dars e’lon qilish (Google Meet)</summary>
                  <form action={announceLesson} className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px]">
                    <input type="hidden" name="sectionId" value={current.id} />
                    <div><label className="label">Mavzu</label><input name="title" placeholder={current.title} className="input" /></div>
                    <div><label className="label">Sana va vaqt</label><input name="startsAt" type="datetime-local" required className="input" /></div>
                    <div className="sm:col-span-2"><label className="label">Google Meet havolasi</label><input name="meetUrl" required placeholder="https://meet.google.com/abc-defg-hij" className="input" /></div>
                    <div className="sm:col-span-2"><button className="btn-primary">E’lon qilish</button> <span className="ml-2 text-xs text-muted">Dars kartasi yuqorida qadab qo‘yiladi va chatga xabar yuboriladi.</span></div>
                  </form>
                </details>
              )}

              <div className="flex gap-2">
                {[["chat", "Chat"], ["materiallar", `Materiallar (${mats.length})`], ["darslar", `Darslar (${pastLessons.length})`]].map(([k, label]) => (
                  <Link key={k} href={tabLink(k)} className={`chip px-4 py-2 text-sm ${tab === k ? "bg-ink text-white" : "hover:bg-[#e9e4df]"}`}>{label}</Link>
                ))}
              </div>

              {tab === "chat" && <Chat sectionId={current.id} meId={user.id} canModerate={manage} />}

              {tab === "materiallar" && (
                <div className="space-y-4">
                  {manage && (
                    <form action={addMaterial} className="card grid gap-3 p-4 sm:grid-cols-2">
                      <input type="hidden" name="sectionId" value={current.id} />
                      <div className="sm:col-span-2"><label className="label">Material nomi</label><input name="title" required placeholder="Masalan: 1-dars slaydlari" className="input" /></div>
                      <div><label className="label">Havola (ixtiyoriy)</label><input name="url" placeholder="https://..." className="input" /></div>
                      <div><label className="label">yoki fayl (maks. 50 MB)</label><input name="file" type="file" className="input py-2" /></div>
                      <div className="sm:col-span-2"><button className="btn-dark btn-sm">+ Material qo‘shish</button></div>
                    </form>
                  )}
                  {mats.length === 0 ? <div className="card border-dashed p-10 text-center text-sm text-muted">Materiallar hali yo‘q.</div> : (
                    <div className="card divide-y divide-line">
                      {mats.map((m) => (
                        <div key={m.id} className="flex items-center gap-4 p-4">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream text-lg">{m.isFile ? "📄" : "🔗"}</span>
                          <div className="min-w-0 flex-1">
                            <a href={m.url} target="_blank" rel="noreferrer" className="block truncate font-bold hover:text-orange">{m.title}</a>
                            <div className="text-xs text-muted">{fmtDateTime(m.createdAt)}</div>
                          </div>
                          <a href={m.url} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">Ochish</a>
                          {manage && <form action={deleteMaterial}><input type="hidden" name="materialId" value={m.id} /><button className="btn-danger btn-sm">✕</button></form>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "darslar" && (
                pastLessons.length === 0 ? <div className="card border-dashed p-10 text-center text-sm text-muted">Bu bo‘limda hali dars e’lon qilinmagan.</div> : (
                  <div className="card divide-y divide-line">
                    {pastLessons.map((l) => (
                      <div key={l.id} className="flex flex-wrap items-center gap-4 p-4">
                        <div className="min-w-0 flex-1"><div className="font-bold">{l.title}</div><div className="text-xs text-muted">{fmtDateTime(l.startsAt)}</div></div>
                        <a href={l.meetUrl} target="_blank" rel="noreferrer" className="btn-ghost btn-sm">Meet havolasi</a>
                        {manage && <form action={deleteLesson}><input type="hidden" name="lessonId" value={l.id} /><button className="btn-danger btn-sm">✕</button></form>}
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
