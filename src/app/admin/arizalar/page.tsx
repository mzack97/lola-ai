import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, courses, enrollments, users } from "@/db";
import { AdminHead, Flash } from "@/components/AdminUi";
import { EnrollmentTable } from "@/components/EnrollmentTable";

export default async function AdminEnrollments({ searchParams }: { searchParams: Promise<{ holat?: string; full?: string }> }) {
  const sp = await searchParams;
  const holat = (["PENDING", "APPROVED", "REJECTED"] as const).find((h) => h === sp.holat);
  const rows = await db.select({ id: enrollments.id, status: enrollments.status, createdAt: enrollments.createdAt, first: users.firstName, last: users.lastName, phone: users.phone, district: users.district, course: courses.title })
    .from(enrollments).innerJoin(users, eq(users.id, enrollments.studentId)).innerJoin(courses, eq(courses.id, enrollments.courseId))
    .where(holat ? eq(enrollments.status, holat) : undefined).orderBy(desc(enrollments.createdAt)).limit(500);
  const tabs = [["", "Barchasi"], ["PENDING", "Kutilmoqda"], ["APPROVED", "Qabul qilingan"], ["REJECTED", "Rad etilgan"]];
  return (
    <div>
      <AdminHead title="Arizalar" sub="Arizalarni odatda kurs ustozi ko‘rib chiqadi. Admin bu yerda kuzatadi va kerak bo‘lsa qarorni o‘zgartiradi." />
      {sp.full && <Flash sp={{ err: "Guruh to‘lgan — avval kurs sig‘imini oshiring." }} />}
      <div className="mb-5 flex flex-wrap gap-2">
        {tabs.map(([k, l]) => <Link key={k} href={k ? `/admin/arizalar?holat=${k}` : "/admin/arizalar"} className={`chip px-4 py-2 text-sm ${(holat ?? "") === k ? "bg-ink text-white" : ""}`}>{l}</Link>)}
      </div>
      <EnrollmentTable rows={rows} back={`/admin/arizalar${holat ? `?holat=${holat}` : ""}`} showCourse />
    </div>
  );
}
