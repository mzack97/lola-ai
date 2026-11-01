"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { CourseCard, type CourseCardData } from "./Cards";

type Cat = { id: string; name: string; slug: string };

export function CourseExplorer({ courses, categories, initial = "", search = true, syncUrl = true, sticky = true }: { courses: (CourseCardData & { categorySlug: string | null })[]; categories: Cat[]; initial?: string; search?: boolean; syncUrl?: boolean; sticky?: boolean }) {
  const [cat, setCat] = useState(initial);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return courses.filter((c) => (!cat || c.categorySlug === cat) && (!s || c.title.toLowerCase().includes(s) || c.summary.toLowerCase().includes(s) || c.teachers.join(" ").toLowerCase().includes(s)));
  }, [courses, cat, q]);

  function choose(slug: string) {
    setCat(slug);
    if (syncUrl) window.history.replaceState(null, "", slug ? `/kurslar?yonalish=${slug}` : "/kurslar");
  }
  const counts = (slug: string) => courses.filter((c) => !slug || c.categorySlug === slug).length;

  return (
    <div>
      <div className={`glass ${sticky ? "sticky top-24" : ""} z-20 mb-8 flex flex-col gap-3 rounded-[28px] p-2 md:flex-row md:items-center`}>
        <LayoutGroup id="cats">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
            {[{ id: "all", name: "Barchasi", slug: "" }, ...categories].map((c) => {
              const active = cat === c.slug;
              return (
                <button key={c.id} onClick={() => choose(c.slug)} className={`relative shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${active ? "text-white" : "text-ink-2 hover:text-orange"}`}>
                  {active && <motion.span layoutId="cat-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
                  {c.name}<span className={`ml-1.5 text-[11px] ${active ? "text-white/60" : "text-muted"}`}>{counts(c.slug)}</span>
                </button>
              );
            })}
          </div>
        </LayoutGroup>
        {search && (
          <div className="relative md:ml-auto md:w-72">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Kurs yoki ustoz qidirish…" className="input !rounded-full !py-2.5 pl-9" />
          </div>
        )}
      </div>

      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((c, i) => (
            <motion.div key={c.id} layout initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
              exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}>
              <CourseCard c={c} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-14 text-center">
          <div className="display text-3xl">Hozircha bo‘sh</div>
          <p className="mt-2 text-sm text-muted">Bu yo‘nalishda kurslar tez orada qo‘shiladi.</p>
        </motion.div>
      )}
    </div>
  );
}
