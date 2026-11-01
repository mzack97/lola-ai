"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, sql } from "drizzle-orm";
import { db, courses, enrollments } from "@/db";
import { requireUser } from "@/lib/auth";
import { courseAccess } from "@/lib/queries";
import { str } from "@/lib/utils";

/** Teacher of the course (or admin) approves / rejects a request. */
export async function decideEnrollment(f: FormData) {
  const u = await requireUser(["TEACHER", "ADMIN"]);
  const id = str(f, "id");
  const decision = str(f, "decision") === "APPROVED" ? "APPROVED" : "REJECTED";
  const [e] = await db.select().from(enrollments).where(eq(enrollments.id, id)).limit(1);
  if (!e) redirect("/");
  const access = await courseAccess(u.id, u.role, e.courseId);
  if (access !== "teacher" && access !== "admin") redirect("/");

  if (decision === "APPROVED" && e.status !== "APPROVED") {
    const [c] = await db.select().from(courses).where(eq(courses.id, e.courseId));
    const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(enrollments)
      .where(and(eq(enrollments.courseId, e.courseId), eq(enrollments.status, "APPROVED")));
    if (n >= c.capacity) redirect(`${str(f, "back") || "/oqituvchi"}?full=1`);
  }
  await db.update(enrollments).set({ status: decision, decidedById: u.id, decidedAt: new Date() }).where(eq(enrollments.id, id));
  const back = str(f, "back") || "/oqituvchi";
  revalidatePath(back);
  redirect(back);
}
