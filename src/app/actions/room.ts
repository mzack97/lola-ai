"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { db, lessons, materials, messages, sections } from "@/db";
import { requireUser } from "@/lib/auth";
import { courseAccess } from "@/lib/queries";
import { fromLocalInput, isUrl, str, fmtDateTime } from "@/lib/utils";
import { saveUpload } from "@/lib/uploads";

/** Only the course's teacher(s) or an admin may manage the curriculum. */
async function manager(courseId: string) {
  const u = await requireUser();
  const a = await courseAccess(u.id, u.role, courseId);
  if (a !== "teacher" && a !== "admin") redirect("/");
  return u;
}
async function sectionCourse(sectionId: string) {
  const [s] = await db.select().from(sections).where(eq(sections.id, sectionId)).limit(1);
  if (!s) redirect("/");
  return s;
}
const back = (courseId: string, sectionId?: string, tab?: string) => {
  revalidatePath(`/xona/${courseId}`);
  redirect(`/xona/${courseId}${sectionId ? `?b=${sectionId}${tab ? `&t=${tab}` : ""}` : ""}`);
};

export async function addSection(f: FormData) {
  const courseId = str(f, "courseId"), title = str(f, "title");
  await manager(courseId);
  if (!title) back(courseId);
  const existing = await db.select().from(sections).where(eq(sections.courseId, courseId));
  const [s] = await db.insert(sections).values({ courseId, title, order: existing.length }).returning();
  back(courseId, s.id);
}

export async function updateSection(f: FormData) {
  const s = await sectionCourse(str(f, "sectionId"));
  await manager(s.courseId);
  const title = str(f, "title");
  await db.update(sections).set({ title: title || s.title, visible: f.get("visible") === "on" }).where(eq(sections.id, s.id));
  back(s.courseId, s.id);
}

export async function moveSection(f: FormData) {
  const s = await sectionCourse(str(f, "sectionId"));
  await manager(s.courseId);
  const dir = str(f, "dir") === "up" ? -1 : 1;
  const list = await db.select().from(sections).where(eq(sections.courseId, s.courseId)).orderBy(asc(sections.order), asc(sections.createdAt));
  const i = list.findIndex((x) => x.id === s.id), j = i + dir;
  if (j >= 0 && j < list.length) {
    [list[i], list[j]] = [list[j], list[i]];
    await Promise.all(list.map((x, k) => db.update(sections).set({ order: k }).where(eq(sections.id, x.id))));
  }
  back(s.courseId, s.id);
}

export async function deleteSection(f: FormData) {
  const s = await sectionCourse(str(f, "sectionId"));
  await manager(s.courseId);
  await db.delete(sections).where(eq(sections.id, s.id));
  back(s.courseId);
}

export async function announceLesson(f: FormData) {
  const s = await sectionCourse(str(f, "sectionId"));
  const u = await manager(s.courseId);
  const title = str(f, "title") || s.title;
  const startsAt = fromLocalInput(str(f, "startsAt"));
  const meetUrl = str(f, "meetUrl");
  if (!startsAt || !isUrl(meetUrl)) back(s.courseId, s.id, "err-lesson");
  await db.insert(lessons).values({ sectionId: s.id, title, startsAt: startsAt!, meetUrl, createdById: u.id });
  await db.insert(messages).values({
    sectionId: s.id, authorId: u.id,
    text: `📅 Dars e’lon qilindi: ${title}\n🕒 ${fmtDateTime(startsAt)}\n🔗 ${meetUrl}`,
  });
  back(s.courseId, s.id);
}

export async function deleteLesson(f: FormData) {
  const [l] = await db.select().from(lessons).where(eq(lessons.id, str(f, "lessonId"))).limit(1);
  if (!l) redirect("/");
  const s = await sectionCourse(l.sectionId);
  await manager(s.courseId);
  await db.delete(lessons).where(eq(lessons.id, l.id));
  back(s.courseId, s.id, "darslar");
}

export async function addMaterial(f: FormData) {
  const s = await sectionCourse(str(f, "sectionId"));
  const u = await manager(s.courseId);
  const title = str(f, "title");
  let url = str(f, "url");
  let isFile = false;
  try {
    const saved = await saveUpload(f.get("file"), "doc");
    if (saved) { url = saved; isFile = true; }
  } catch {
    back(s.courseId, s.id, "err-file");
  }
  if (!title || !(isFile || isUrl(url))) back(s.courseId, s.id, "err-material");
  await db.insert(materials).values({ sectionId: s.id, title, url, isFile, uploadedById: u.id });
  back(s.courseId, s.id, "materiallar");
}

export async function deleteMaterial(f: FormData) {
  const [m] = await db.select().from(materials).where(eq(materials.id, str(f, "materialId"))).limit(1);
  if (!m) redirect("/");
  const s = await sectionCourse(m.sectionId);
  await manager(s.courseId);
  await db.delete(materials).where(eq(materials.id, m.id));
  back(s.courseId, s.id, "materiallar");
}

export async function togglePin(f: FormData) {
  const [m] = await db.select().from(messages).where(eq(messages.id, str(f, "messageId"))).limit(1);
  if (!m) redirect("/");
  const s = await sectionCourse(m.sectionId);
  await manager(s.courseId);
  await db.update(messages).set({ pinned: !m.pinned }).where(and(eq(messages.id, m.id)));
  back(s.courseId, s.id);
}
