import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db, courses, enrollments, users } from "@/db";
import { fmtDate, formatPhone, roleLabel } from "@/lib/utils";
import { AdminHead } from "@/components/AdminUi";

export default async function Dashboard() {
  const count = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;
  const [students, teachers, courseN, pending, latest] = await Promise.all([
    count(db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "STUDENT"))),
    count(db.select({ n: sql<number>`count(*)::int` }).from(users).where(eq(users.role, "TEACHER"))),
    count(db.select({ n: sql<number>`count(*)::int` }).from(courses)),
    count(db.select({ n: sql<number>`count(*)::int` }).from(enrollments).where(eq(enrollments.status, "PENDING"))),
    db.select().from(users).orderBy(desc(users.createdAt)).limit(8),
  ]);
  const stats = [
    { k: "Talabalar", v: students, href: "/admin/foydalanuvchilar?rol=STUDENT" },
    { k: "O‘qituvchilar", v: teachers, href: "/admin/foydalanuvchilar?rol=TEACHER" },
    { k: "Kurslar", v: courseN, href: "/admin/kurslar" },
    { k: "Ustoz kutayotgan arizalar", v: pending, href: "/admin/arizalar?holat=PENDING" },
  ];
  return (
    <div>
      <AdminHead title="Bosh panel" sub="Platformaning umumiy holati" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.k} href={s.href} className="card p-5 transition hover:border-orange">
            <div className="text-xs font-bold uppercase tracking-wider text-muted">{s.k}</div>
            <div className="mt-2 text-4xl font-extrabold">{s.v}</div>
          </Link>
        ))}
      </div>
      <h2 className="mb-3 mt-10 font-extrabold">So‘nggi ro‘yxatdan o‘tganlar</h2>
      <div className="card divide-y divide-line">
        {latest.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-4 p-4 text-sm">
            <div className="min-w-0 flex-1 font-bold">{u.firstName} {u.lastName}</div>
            <span className="font-mono text-xs">{formatPhone(u.phone)}</span>
            <span className="text-muted">{u.district || u.region || "—"}</span>
            <span className="chip">{roleLabel[u.role]}</span>
            <span className="text-xs text-muted">{fmtDate(u.createdAt)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
