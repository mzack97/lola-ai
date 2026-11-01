import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, courses, enrollments, users } from "@/db";
import { requireUser } from "@/lib/auth";
import { courseAccess } from "@/lib/queries";
import { EnrollmentTable } from "@/components/EnrollmentTable";

export const metadata = { title: "Arizalar" };

export default async function TeacherCourse({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ full?: string }> }) {
  const u = await requireUser(["TEACHER", "ADMIN"]);
  const { id } = await params;
  const { full } = await searchParams;
  const [c] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  if (!c) notFound();
  const a = await courseAccess(u.id, u.role, id);
  if (a !== "teacher" && a !== "admin") redirect("/oqituvchi");
  const rows = await db.select({ id: enrollments.id, status: enrollments.status, createdAt: enrollments.createdAt, first: users.firstName, last: users.lastName, phone: users.phone, district: users.district })
    .from(enrollments).innerJoin(users, eq(users.id, enrollments.studentId)).where(eq(enrollments.courseId, id)).orderBy(asc(enrollments.createdAt));
  const back = `/oqituvchi/kurs/${id}`;
  const approved = rows.filter((r) => r.status === "APPROVED").length;
  return (
    <div className="container-x py-14">
      <Link href="/oqituvchi" className="text-sm font-semibold text-muted hover:text-orange">← Kurslarim</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div><div className="kicker">Arizalar va talabalar</div><h1 className="mt-2 h-title">{c.title}</h1></div>
        <Link href={`/xona/${id}`} className="btn-primary">Kurs xonasi →</Link>
      </div>
      {full && <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Guruh to‘lgan ({c.capacity} o‘rin). Avval joy bo‘shating yoki administratordan sig‘imni oshirishni so‘rang.</div>}
      <h2 className="mb-3 mt-10 font-extrabold">Yangi arizalar ({rows.filter((r) => r.status === "PENDING").length})</h2>
      <EnrollmentTable rows={rows.filter((r) => r.status === "PENDING")} back={back} />
      <h2 className="mb-3 mt-10 font-extrabold">Talabalar ({approved} / {c.capacity})</h2>
      <EnrollmentTable rows={rows.filter((r) => r.status === "APPROVED")} back={back} />
      <h2 className="mb-3 mt-10 font-extrabold text-muted">Rad etilganlar</h2>
      <EnrollmentTable rows={rows.filter((r) => r.status === "REJECTED")} back={back} />
    </div>
  );
}
