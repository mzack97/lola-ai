"use server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, users } from "@/db";
import { checkPassword, hashPassword, requireUser } from "@/lib/auth";
import { str } from "@/lib/utils";
import type { FormState } from "./auth";
import { saveUpload } from "@/lib/uploads";

export async function saveProfile(_: FormState, f: FormData): Promise<FormState> {
  const u = await requireUser();
  const firstName = str(f, "firstName"), lastName = str(f, "lastName");
  if (firstName.length < 2 || lastName.length < 2) return { error: "Ism va familiyani to‘liq kiriting." };
  let avatarUrl: string | null | undefined;
  try { avatarUrl = await saveUpload(f.get("avatar"), "image"); } catch (e) { return { error: (e as Error).message }; }
  await db.update(users).set({ firstName, lastName, region: str(f, "region") || null, district: str(f, "district") || null, ...(avatarUrl ? { avatarUrl } : {}) }).where(eq(users.id, u.id));
  revalidatePath("/", "layout");
  revalidatePath("/kabinet/profil");
  return { ok: "Saqlandi." };
}

export async function changePassword(_: FormState, f: FormData): Promise<FormState> {
  const u = await requireUser();
  const cur = str(f, "current"), p1 = str(f, "password"), p2 = str(f, "password2");
  if (!(await checkPassword(cur, u.passwordHash))) return { error: "Joriy parol noto‘g‘ri." };
  if (p1.length < 6) return { error: "Yangi parol kamida 6 belgi bo‘lsin." };
  if (p1 !== p2) return { error: "Parollar bir xil emas." };
  await db.update(users).set({ passwordHash: await hashPassword(p1) }).where(eq(users.id, u.id));
  return { ok: "Parol o‘zgartirildi." };
}
