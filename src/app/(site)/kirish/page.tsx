import { redirect } from "next/navigation";
import { getUser, homeFor } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";

export const metadata = { title: "Kirish" };

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const u = await getUser();
  if (u) redirect(homeFor(u));
  const { next } = await searchParams;
  return <AuthShell title="Kirish" sub="Telefon raqamingiz va parolingiz bilan kiring."><LoginForm next={next} /></AuthShell>;
}
