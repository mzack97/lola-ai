import { NextResponse } from "next/server";
import { and, asc, eq, gt } from "drizzle-orm";
import { db, messages, sections, users } from "@/db";
import { getUser } from "@/lib/auth";
import { courseAccess } from "@/lib/queries";

async function guard(sectionId: string) {
  const u = await getUser();
  if (!u) return null;
  const [s] = await db.select().from(sections).where(eq(sections.id, sectionId)).limit(1);
  if (!s) return null;
  const access = await courseAccess(u.id, u.role, s.courseId);
  if (!access || (access === "student" && !s.visible)) return null;
  return { u, s, access };
}

const select = { id: messages.id, text: messages.text, pinned: messages.pinned, createdAt: messages.createdAt, authorId: messages.authorId, first: users.firstName, last: users.lastName, role: users.role, avatar: users.avatarUrl };

/** GET ?after=ISO → new messages since that time (the room polls this every few seconds) */
export async function GET(req: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const g = await guard(sectionId);
  if (!g) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const after = new URL(req.url).searchParams.get("after");
  const conds = [eq(messages.sectionId, sectionId)];
  if (after && !isNaN(Date.parse(after))) conds.push(gt(messages.createdAt, new Date(after)));
  const rows = await db.select(select).from(messages).innerJoin(users, eq(users.id, messages.authorId))
    .where(and(...conds)).orderBy(asc(messages.createdAt)).limit(after ? 100 : 300);
  return NextResponse.json({ messages: rows });
}

/** POST { text } → send a message */
export async function POST(req: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const g = await guard(sectionId);
  if (!g) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "").trim().slice(0, 4000);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  const [m] = await db.insert(messages).values({ sectionId, authorId: g.u.id, text }).returning();
  return NextResponse.json({ message: { ...m, first: g.u.firstName, last: g.u.lastName, role: g.u.role, avatar: g.u.avatarUrl } });
}

/** DELETE ?id= → author, teacher or admin can remove a message */
export async function DELETE(req: Request, { params }: { params: Promise<{ sectionId: string }> }) {
  const { sectionId } = await params;
  const g = await guard(sectionId);
  if (!g) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const id = new URL(req.url).searchParams.get("id") || "";
  const [m] = await db.select().from(messages).where(and(eq(messages.id, id), eq(messages.sectionId, sectionId))).limit(1);
  if (!m) return NextResponse.json({ ok: true });
  if (m.authorId !== g.u.id && g.access === "student") return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await db.delete(messages).where(eq(messages.id, id));
  return NextResponse.json({ ok: true });
}
