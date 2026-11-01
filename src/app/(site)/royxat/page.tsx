import { redirect } from "next/navigation";
import { getUser, homeFor } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/AuthForms";

export const metadata = { title: "Ro‘yxatdan o‘tish" };

export default async function Register({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const u = await getUser();
  if (u) redirect(homeFor(u));
  const { next } = await searchParams;
  return <AuthShell title="Ro‘yxatdan o‘tish" sub="Bir daqiqada hisob oching va kurslarga ariza qoldiring."><RegisterForm next={next} /></AuthShell>;
}
