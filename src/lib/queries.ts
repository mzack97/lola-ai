import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db, categories, courses, courseTeachers, enrollments, news, users } from "@/db";

export type { CourseCardData } from "@/components/Cards";

export async function listCourses(opts: { categorySlug?: string; limit?: number; onlyPublished?: boolean } = {}) {
  const conds = [];
  if (opts.onlyPublished !== false) conds.push(eq(courses.published, true));
  if (opts.categorySlug) conds.push(eq(categories.slug, opts.categorySlug));
  const rows = await db
    .select({ c: courses, category: categories.name, categorySlug: categories.slug })
    .from(courses)
    .leftJoin(categories, eq(categories.id, courses.categoryId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(courses.createdAt))
    .limit(opts.limit ?? 100);
  return decorate(rows.map((r) => ({ ...r.c, category: r.category, categorySlug: r.categorySlug })));
}

async function decorate<T extends { id: string }>(list: T[]) {
  if (!list.length) return [] as (T & { teachers: string[]; approved: number })[];
  const ids = list.map((c) => c.id);
  const t = await db
    .select({ courseId: courseTeachers.courseId, first: users.firstName, last: users.lastName })
    .from(courseTeachers).innerJoin(users, eq(users.id, courseTeachers.teacherId))
    .where(inArray(courseTeachers.courseId, ids));
  const counts = await db
    .select({ courseId: enrollments.courseId, n: sql<number>`count(*)::int` })
    .from(enrollments)
    .where(and(inArray(enrollments.courseId, ids), eq(enrollments.status, "APPROVED")))
    .groupBy(enrollments.courseId);
  return list.map((c) => ({
    ...c,
    teachers: t.filter((x) => x.courseId === c.id).map((x) => `${x.first} ${x.last}`),
    approved: counts.find((x) => x.courseId === c.id)?.n ?? 0,
  }));
}

export async function getCourseBySlug(slug: string) {
  const r = await db.select({ c: courses, category: categories.name }).from(courses)
    .leftJoin(categories, eq(categories.id, courses.categoryId)).where(eq(courses.slug, slug)).limit(1);
  if (!r[0]) return null;
  return (await decorate([{ ...r[0].c, category: r[0].category }]))[0];
}

export const listCategories = () => db.select().from(categories).orderBy(asc(categories.order), asc(categories.name));

export const listNews = (limit = 50) =>
  db.select().from(news).where(eq(news.published, true)).orderBy(desc(news.publishedAt)).limit(limit);

/** Can this user open the course room? Returns "teacher" | "student" | "admin" | null */
export async function courseAccess(userId: string, role: string, courseId: string) {
  if (role === "ADMIN") return "admin" as const;
  const t = await db.select().from(courseTeachers).where(and(eq(courseTeachers.courseId, courseId), eq(courseTeachers.teacherId, userId))).limit(1);
  if (t[0]) return "teacher" as const;
  const e = await db.select().from(enrollments).where(and(eq(enrollments.courseId, courseId), eq(enrollments.studentId, userId), eq(enrollments.status, "APPROVED"))).limit(1);
  return e[0] ? ("student" as const) : null;
}
