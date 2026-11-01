import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { db, sessions, users, type User } from "@/db";

const COOKIE = "lola_session";
const DAYS = 30;

const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const checkPassword = (p: string, h: string) => bcrypt.compare(p, h);

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + DAYS * 864e5);
  await db.insert(sessions).values({ id: hashToken(token), userId, expiresAt });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", path: "/", expires: expiresAt,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  jar.delete(COOKIE);
}

/** Current logged-in user (or null). Cached for one request. */
export const getUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  const u = rows[0]?.user;
  if (!u || u.status === "BLOCKED") return null;
  return u;
});

/** Use in pages/actions: redirects to login if not signed in, or home if role is wrong. */
export async function requireUser(roles?: User["role"][]) {
  const u = await getUser();
  if (!u) redirect("/kirish");
  if (roles && !roles.includes(u.role)) redirect("/");
  return u;
}

export const homeFor = (u: User) => (u.role === "ADMIN" ? "/admin" : u.role === "TEACHER" ? "/oqituvchi" : "/kabinet");
