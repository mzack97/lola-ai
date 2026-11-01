"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { db, courses, enrollments } from "@/db";
import { requireUser } from "@/lib/auth";

export async function enrollAction(formData: FormData) {
  const user = await requireUser();
  const courseId = String(formData.get("courseId") || "");
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course || !course.published) redirect("/kurslar");
  if (user.role !== "STUDENT") redirect(`/kurslar/${course.slug}`);

  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(enrollments)
    .where(and(eq(enrollments.courseId, courseId), eq(enrollments.status, "APPROVED")));
  const status = course.autoApprove && n < course.capacity ? "APPROVED" : "PENDING";

  await db.insert(enrollments)
    .values({ courseId, studentId: user.id, status, decidedAt: status === "APPROVED" ? new Date() : null })
    .onConflictDoNothing();
  revalidatePath(`/kurslar/${course.slug}`);
  redirect("/kabinet");
}
