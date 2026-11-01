import { Aurora } from "@/components/motion";
import Link from "next/link";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db, courses, courseTeachers, enrollments } from "@/db";
import { requireUser } from "@/lib/auth";
import { CabinetHead } from "@/components/CabinetNav";
import { Empty } from "@/components/Cards";

export const metadata = { title: "O‘qituvchi kabineti" };

export default async function TeacherHome() {
  const u = await requireUser(["TEACHER", "ADMIN"]);
  const mine = await db.select({ c: courses }).from(courseTeachers).innerJoin(courses, eq(courses.id, courseTeachers.courseId)).where(eq(courseTeachers.teacherId, u.id));
  const ids = mine.map((m) => m.c.id);
  const counts = ids.length
    ? await db.select({ courseId: enrollments.courseId, status: enrollments.status, n: sql<number>`count(*)::int` }).from(enrollments).where(inArray(enrollments.courseId, ids)).groupBy(enrollments.courseId, enrollments.status)
    : [];
  const n = (id: string, s: string) => counts.find((x) => x.courseId === id && x.status === s)?.n ?? 0;

  return (
    <div className="container-x pb-14 pt-32">
      <Aurora variant="cool" className="!fixed opacity-60" />
      <CabinetHead user={u} title="Mening kurslarim" links={[{ href: "/oqituvchi", label: "Kurslarim", active: true }, { href: "/kabinet/profil", label: "Profil" }]} />
      {mine.length === 0 ? <Empty>Sizga hali kurs biriktirilmagan. Administrator kursga biriktirgach, u shu yerda paydo bo‘ladi.</Empty> : (
        <div className="grid gap-4 md:grid-cols-2">
          {mine.map(({ c }) => (
            <div key={c.id} className="card p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-extrabold">{c.title}</h3>
                {!c.published && <span className="chip">Nashr etilmagan</span>}
              </div>
              <div className="mt-4 flex gap-3 text-sm">
                <span className="chip bg-cream">Yangi arizalar: <b className="ml-1">{n(c.id, "PENDING")}</b></span>
                <span className="chip">Talabalar: <b className="ml-1">{n(c.id, "APPROVED")} / {c.capacity}</b></span>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/xona/${c.id}`} className="btn-primary btn-sm">Kurs xonasi va o‘quv reja</Link>
                <Link href={`/oqituvchi/kurs/${c.id}`} className="btn-ghost btn-sm">Arizalar va talabalar</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
