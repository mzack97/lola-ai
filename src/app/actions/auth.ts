"use server";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { checkPassword, createSession, hashPassword, homeFor } from "@/lib/auth";
import { normalizePhone, str } from "@/lib/utils";
import { REGIONS } from "@/lib/regions";

export type FormState = { error?: string; ok?: string } | undefined;

const safeNext = (n: string) => (n.startsWith("/") && !n.startsWith("//") ? n : "");

// very small in-memory brake against password guessing
const attempts = new Map<string, { n: number; t: number }>();
function tooMany(key: string) {
  const now = Date.now(), a = attempts.get(key);
  if (!a || now - a.t > 15 * 60e3) { attempts.set(key, { n: 1, t: now }); return false; }
  a.n++; return a.n > 10;
}

export async function registerAction(_: FormState, f: FormData): Promise<FormState> {
  const firstName = str(f, "firstName"), lastName = str(f, "lastName");
  const phone = normalizePhone(str(f, "phone"));
  const password = str(f, "password"), password2 = str(f, "password2");
  const region = str(f, "region"), district = str(f, "district");
  const birth = str(f, "birthDate");

  if (firstName.length < 2 || lastName.length < 2) return { error: "Ism va familiyani to‘liq kiriting." };
  if (!phone) return { error: "Telefon raqam noto‘g‘ri. Masalan: 90 123 45 67" };
  if (password.length < 6) return { error: "Parol kamida 6 belgidan iborat bo‘lsin." };
  if (password !== password2) return { error: "Parollar bir xil emas." };
  if (region && !REGIONS.includes(region)) return { error: "Hududni ro‘yxatdan tanlang." };
  const birthDate = birth ? new Date(birth + "T00:00:00Z") : null;
  if (birthDate && (isNaN(+birthDate) || birthDate > new Date())) return { error: "Tug‘ilgan sana noto‘g‘ri." };

  const exists = await db.select({ id: users.id }).from(users).where(eq(users.phone, phone)).limit(1);
  if (exists[0]) return { error: "Bu raqam bilan allaqachon ro‘yxatdan o‘tilgan. «Kirish» sahifasidan foydalaning." };

  const [u] = await db.insert(users).values({
    firstName, lastName, phone, passwordHash: await hashPassword(password),
    birthDate, region: region || null, district: district || null,
  }).returning();
  await createSession(u.id);
  redirect(safeNext(str(f, "next")) || homeFor(u));
}

export async function loginAction(_: FormState, f: FormData): Promise<FormState> {
  const phone = normalizePhone(str(f, "phone"));
  const password = str(f, "password");
  if (!phone || !password) return { error: "Telefon va parolni kiriting." };
  if (tooMany(phone)) return { error: "Juda ko‘p urinish. 15 daqiqadan so‘ng qayta urinib ko‘ring." };
  const [u] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  if (!u || !(await checkPassword(password, u.passwordHash))) return { error: "Telefon yoki parol noto‘g‘ri." };
  if (u.status === "BLOCKED") return { error: "Hisobingiz bloklangan. Administratorga murojaat qiling." };
  attempts.delete(phone);
  await createSession(u.id);
  redirect(safeNext(str(f, "next")) || homeFor(u));
}
