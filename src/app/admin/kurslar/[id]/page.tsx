import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, courses, courseTeachers } from "@/db";
import { deleteCourse } from "@/app/actions/admin";
import { AdminHead, Back, ConfirmButton, Flash } from "@/components/AdminUi";
import { CourseForm } from "@/components/CourseForm";

export default async function EditCourse({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { id } = await params;
  const [c] = await db.select().from(courses).where(eq(courses.id, id));
  if (!c) notFound();
  const t = await db.select().from(courseTeachers).where(eq(courseTeachers.courseId, id));
  return (
    <div>
      <Back href="/admin/kurslar" label="Kurslar" />
      <AdminHead title={c.title} action={
        <div className="flex flex-wrap items-start gap-2">
          <Link href={`/kurslar/${c.slug}`} className="btn-ghost btn-sm">Saytda ko‘rish</Link>
          <Link href={`/xona/${c.id}`} className="btn-ghost btn-sm">Kurs xonasi</Link>
          <Link href={`/oqituvchi/kurs/${c.id}`} className="btn-ghost btn-sm">Arizalar</Link>
          <form action={deleteCourse}><input type="hidden" name="id" value={c.id} /><ConfirmButton msg="Kurs, uning bo‘limlari, chatlari va arizalari o‘chadi.">O‘chirish</ConfirmButton></form>
        </div>} />
      <Flash sp={await searchParams} />
      <CourseForm c={c} teacherIds={t.map((x) => x.teacherId)} />
    </div>
  );
}
