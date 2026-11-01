import { Aurora } from "@/components/motion";
import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, courses, enrollments } from "@/db";
import { requireUser } from "@/lib/auth";
import { statusLabel, fmtDate } from "@/lib/utils";
import { CabinetHead } from "@/components/CabinetNav";
import { CourseCover, Empty } from "@/components/Cards";

export const metadata = { title: "Kabinet" };

export default async function Cabinet() {
  const user = await requireUser();
  const rows = await db.select({ e: enrollments, c: courses }).from(enrollments)
    .innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(eq(enrollments.studentId, user.id)).orderBy(desc(enrollments.createdAt));
  const tone = { PENDING: "bg-cream text-ink", APPROVED: "bg-green-100 text-green-800", REJECTED: "bg-[#f3efeb] text-muted" } as const;

  return (
    <div className="container-x pb-14 pt-32">
      <Aurora variant="cool" className="!fixed opacity-60" />
      <CabinetHead user={user} title="Mening kurslarim" links={[{ href: "/kabinet", label: "Kurslarim", active: true }, { href: "/kabinet/profil", label: "Profil" }, { href: "/kurslar", label: "Kurslar katalogi" }]} />
      {rows.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(({ e, c }) => (
            <div key={e.id} className="card flex flex-col p-2">
              <div className="relative aspect-[21/8] overflow-hidden rounded-[22px]"><CourseCover c={{ title: c.title, coverUrl: c.coverUrl, category: null }} /></div>
              <div className="flex flex-col p-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl font-bold">{c.title}</h3>
                <span className={`chip shrink-0 ${tone[e.status]}`}>{statusLabel[e.status]}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{c.schedule || c.format}{c.startDate ? ` · ${fmtDate(c.startDate)} dan` : ""}</p>
              <div className="mt-5">
                {e.status === "APPROVED" ? <Link href={`/xona/${c.id}`} className="btn-primary">Kurs xonasiga kirish →</Link>
                  : e.status === "PENDING" ? <p className="text-sm text-muted">Ustoz arizangizni ko‘rib chiqmoqda.</p>
                  : <Link href="/kurslar" className="btn-ghost btn-sm">Boshqa kurslarni ko‘rish</Link>}
              </div>
              </div>
            </div>
          ))}
        </div>
      ) : <Empty>Siz hali hech qaysi kursga ariza qoldirmagansiz. <Link href="/kurslar" className="font-bold text-orange">Kurslarni ko‘ring →</Link></Empty>}
    </div>
  );
}
