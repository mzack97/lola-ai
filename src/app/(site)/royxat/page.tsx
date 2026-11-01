import { redirect } from "next/navigation";
import { getUser, homeFor } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/AuthForms";

export const metadata = { title: "Ro‘yxatdan o‘tish" };

export default async function Register({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const u = await getUser();
  if (u) redirect(homeFor(u));
  const { next } = await searchParams;
  return <AuthShell side="register" title="Kelajak kasbingiz" accent="shu yerdan" sub="Bir daqiqada hisob oching, kursni tanlang va jonli darslarga qo‘shiling."><RegisterForm next={next} /></AuthShell>;
}
