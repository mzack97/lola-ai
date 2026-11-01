import "server-only";
import { asc } from "drizzle-orm";
import { db, landingBlocks, settings, teamMembers } from "@/db";

export const BLOCK_DEFAULTS: Record<string, { title: string; text: string; order: number }> = {
  hero: {
    order: 0,
    title: "Kelajak kasblari uchun imkoniyat",
    text: "LOLA AI — sun’iy intellekt yordamida qizlar va xotin-qizlarni zamonaviy kasblarga o‘qitadigan platforma. Onlayn darslar, tajribali ustozlar va amaliyot — bir joyda.",
  },
  about: {
    order: 1,
    title: "Loyiha haqida",
    text: "LOLA AI — Namangan viloyatida xotin-qizlarni zamonaviy kasb-hunarga o‘qitish va bandligini ta’minlashga qaratilgan loyiha. Platforma Namangan viloyati sun’iy intellekt bo‘yicha maslahatchilari jamoasi tomonidan ishlab chiqilgan va rivojlantirilmoqda.\n\nBu yerda o‘qish, amaliyot va ish bir zanjirga bog‘langan: kurs tanlaysiz, ustoz bilan onlayn darslarda o‘qiysiz, so‘ng amaliyot va ish topishda ko‘mak olasiz.",
  },
  freelance: { order: 3, title: "Frilans", text: "Bilimingizni daromadga aylantiring: buyurtmalar, loyihalar va mijozlar bir joyda." },
  marketplace: { order: 4, title: "Marketplace", text: "Qo‘l mehnati va raqamli mahsulotlaringizni sotish uchun maydon." },
  contacts: { order: 6, title: "Biz bilan bog‘laning", text: "Savollaringiz bo‘lsa, yozing yoki qo‘ng‘iroq qiling." },
};

export const SETTING_KEYS = [
  { key: "phone", label: "Telefon" },
  { key: "telegram", label: "Telegram (havola)" },
  { key: "instagram", label: "Instagram (havola)" },
  { key: "email", label: "E-mail" },
  { key: "address", label: "Manzil" },
] as const;

export async function getBlocks() {
  const rows = await db.select().from(landingBlocks);
  const out: Record<string, { title: string; text: string; imageUrl: string | null; visible: boolean }> = {};
  for (const [k, d] of Object.entries(BLOCK_DEFAULTS)) out[k] = { title: d.title, text: d.text, imageUrl: null, visible: true };
  for (const r of rows) out[r.key] = { title: r.title, text: r.text, imageUrl: r.imageUrl, visible: r.visible };
  return out;
}

export async function getSettings() {
  const rows = await db.select().from(settings);
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

export const getTeam = () => db.select().from(teamMembers).orderBy(asc(teamMembers.order));
