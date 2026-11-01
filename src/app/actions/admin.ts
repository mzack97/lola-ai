"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, ne } from "drizzle-orm";
import { db, categories, courses, courseTeachers, landingBlocks, news, sessions, settings, teamMembers, users } from "@/db";
import { hashPassword, requireUser } from "@/lib/auth";
import { fromLocalInput, normalizePhone, slugify, str } from "@/lib/utils";
import { saveUpload } from "@/lib/uploads";
import { BLOCK_DEFAULTS, SETTING_KEYS } from "@/lib/content";

const admin = () => requireUser(["ADMIN"]);
const go = (path: string, q?: string): never => { revalidatePath("/", "layout"); redirect(q ? `${path}?${q}` : path); };

async function uniqueSlug(table: typeof courses | typeof news, base: string, exceptId?: string) {
  let slug = slugify(base), i = 1;
  for (;;) {
    const hit = await db.select({ id: table.id }).from(table).where(exceptId ? and(eq(table.slug, slug), ne(table.id, exceptId)) : eq(table.slug, slug)).limit(1);
    if (!hit[0]) return slug;
    slug = `${slugify(base)}-${++i}`;
  }
}
async function upload(f: FormData, key: string, back: string) {
  try { return await saveUpload(f.get(key), "image"); }
  catch (e) { return go(back, "err=" + encodeURIComponent((e as Error).message)); }
}

/* ---------------- categories ---------------- */
export async function saveCategory(f: FormData) {
  await admin();
  const id = str(f, "id"), name = str(f, "name"), order = Number(str(f, "order")) || 0;
  if (!name) go("/admin/kategoriyalar");
  if (id) await db.update(categories).set({ name, order }).where(eq(categories.id, id));
  else await db.insert(categories).values({ name, order, slug: slugify(name) }).onConflictDoNothing();
  go("/admin/kategoriyalar", "ok=1");
}
export async function deleteCategory(f: FormData) {
  await admin();
  await db.delete(categories).where(eq(categories.id, str(f, "id")));
  go("/admin/kategoriyalar", "ok=1");
}

/* ---------------- courses ---------------- */
export async function saveCourse(f: FormData) {
  await admin();
  const id = str(f, "id");
  const back = id ? `/admin/kurslar/${id}` : "/admin/kurslar/yangi";
  const title = str(f, "title");
  if (!title) go(back, "err=" + encodeURIComponent("Kurs nomini kiriting."));
  const cover = await upload(f, "cover", back);
  const startDate = str(f, "startDate") ? fromLocalInput(str(f, "startDate") + "T09:00") : null;
  const data = {
    title,
    categoryId: str(f, "categoryId") || null,
    summary: str(f, "summary"),
    description: str(f, "description"),
    format: str(f, "format") || "Onlayn · Google Meet",
    schedule: str(f, "schedule"),
    startDate,
    capacity: Math.max(1, Number(str(f, "capacity")) || 30),
    autoApprove: f.get("autoApprove") === "on",
    published: f.get("published") === "on",
    ...(cover ? { coverUrl: cover } : {}),
    ...(f.get("removeCover") === "on" ? { coverUrl: null } : {}),
  };
  let courseId = id;
  if (id) {
    await db.update(courses).set({ ...data, slug: await uniqueSlug(courses, str(f, "slug") || title, id) }).where(eq(courses.id, id));
  } else {
    const [c] = await db.insert(courses).values({ ...data, slug: await uniqueSlug(courses, title) }).returning();
    courseId = c.id;
  }
  // teachers (checkboxes)
  const teacherIds = f.getAll("teacherIds").map(String).filter(Boolean);
  await db.delete(courseTeachers).where(eq(courseTeachers.courseId, courseId));
  if (teacherIds.length) await db.insert(courseTeachers).values(teacherIds.map((t) => ({ courseId, teacherId: t })));
  go(`/admin/kurslar/${courseId}`, "ok=1");
}
export async function deleteCourse(f: FormData) {
  await admin();
  await db.delete(courses).where(eq(courses.id, str(f, "id")));
  go("/admin/kurslar", "ok=1");
}

/* ---------------- news ---------------- */
export async function saveNews(f: FormData) {
  await admin();
  const id = str(f, "id");
  const back = id ? `/admin/yangiliklar/${id}` : "/admin/yangiliklar/yangi";
  const title = str(f, "title");
  if (!title) go(back, "err=" + encodeURIComponent("Sarlavhani kiriting."));
  const cover = await upload(f, "cover", back);
  const published = f.get("published") === "on";
  const [old] = id ? await db.select().from(news).where(eq(news.id, id)) : [];
  const data = {
    title, excerpt: str(f, "excerpt"), body: str(f, "body"), published,
    publishedAt: published ? (old?.publishedAt ?? new Date()) : old?.publishedAt ?? null,
    ...(cover ? { coverUrl: cover } : {}),
    ...(f.get("removeCover") === "on" ? { coverUrl: null } : {}),
  };
  let newsId = id;
  if (id) await db.update(news).set({ ...data, slug: await uniqueSlug(news, title, id) }).where(eq(news.id, id));
  else newsId = (await db.insert(news).values({ ...data, slug: await uniqueSlug(news, title) }).returning())[0].id;
  go(`/admin/yangiliklar/${newsId}`, "ok=1");
}
export async function deleteNews(f: FormData) {
  await admin();
  await db.delete(news).where(eq(news.id, str(f, "id")));
  go("/admin/yangiliklar", "ok=1");
}

/* ---------------- landing page ---------------- */
export async function saveBlock(f: FormData) {
  await admin();
  const key = str(f, "key");
  if (!BLOCK_DEFAULTS[key]) go("/admin/sahifa");
  const img = await upload(f, "image", "/admin/sahifa");
  const values = { key, title: str(f, "title") || BLOCK_DEFAULTS[key].title, text: str(f, "text"), visible: f.get("visible") === "on", order: BLOCK_DEFAULTS[key].order, ...(img ? { imageUrl: img } : {}) };
  await db.insert(landingBlocks).values(values).onConflictDoUpdate({ target: landingBlocks.key, set: values });
  go("/admin/sahifa", "ok=1#" + key);
}
export async function saveSettings(f: FormData) {
  await admin();
  for (const { key } of SETTING_KEYS) {
    const value = str(f, key);
    await db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  go("/admin/sahifa", "ok=1");
}
export async function saveTeamMember(f: FormData) {
  await admin();
  const id = str(f, "id"), name = str(f, "name"), role = str(f, "role");
  if (!name) go("/admin/sahifa");
  const photo = await upload(f, "photo", "/admin/sahifa");
  const data = { name, role, order: Number(str(f, "order")) || 0, ...(photo ? { photoUrl: photo } : {}) };
  if (id) await db.update(teamMembers).set(data).where(eq(teamMembers.id, id));
  else await db.insert(teamMembers).values(data);
  go("/admin/sahifa", "ok=1#team");
}
export async function deleteTeamMember(f: FormData) {
  await admin();
  await db.delete(teamMembers).where(eq(teamMembers.id, str(f, "id")));
  go("/admin/sahifa", "ok=1#team");
}

/* ---------------- users ---------------- */
export async function createUser(f: FormData) {
  await admin();
  const phone = normalizePhone(str(f, "phone"));
  const password = str(f, "password");
  const role = (["STUDENT", "TEACHER", "ADMIN"] as const).find((r) => r === str(f, "role")) ?? "TEACHER";
  if (!phone || password.length < 6 || !str(f, "firstName") || !str(f, "lastName"))
    go("/admin/foydalanuvchilar", "err=" + encodeURIComponent("Ism, familiya, to‘g‘ri telefon va kamida 6 belgili parol kerak."));
  const exists = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone!)).limit(1);
  if (exists[0]) go("/admin/foydalanuvchilar", "err=" + encodeURIComponent("Bu telefon raqam bilan foydalanuvchi bor. Uning rolini o‘zgartiring."));
  await db.insert(users).values({ firstName: str(f, "firstName"), lastName: str(f, "lastName"), phone: phone!, passwordHash: await hashPassword(password), role });
  go("/admin/foydalanuvchilar", "ok=1");
}
export async function updateUser(f: FormData) {
  const me = await admin();
  const id = str(f, "id");
  const back = str(f, "back") || "/admin/foydalanuvchilar";
  const role = (["STUDENT", "TEACHER", "ADMIN"] as const).find((r) => r === str(f, "role"));
  const status = str(f, "status") === "BLOCKED" ? "BLOCKED" : "ACTIVE";
  if (id === me.id && (role !== "ADMIN" || status === "BLOCKED")) go(back, "err=" + encodeURIComponent("O‘zingizning admin huquqingizni olib tashlay olmaysiz."));
  await db.update(users).set({ ...(role ? { role } : {}), status }).where(eq(users.id, id));
  if (status === "BLOCKED") await db.delete(sessions).where(eq(sessions.userId, id));
  const pw = str(f, "newPassword");
  if (pw) {
    if (pw.length < 6) go(back, "err=" + encodeURIComponent("Yangi parol kamida 6 belgi bo‘lsin."));
    await db.update(users).set({ passwordHash: await hashPassword(pw) }).where(eq(users.id, id));
    await db.delete(sessions).where(eq(sessions.userId, id));
  }
  go(back, "ok=1");
}
