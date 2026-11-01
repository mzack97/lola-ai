import Link from "next/link";
import Image from "next/image";
import { requireUser } from "@/lib/auth";
import { Aurora } from "@/components/motion";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Bosh panel" },
  { href: "/admin/sahifa", label: "Bosh sahifa bloklari" },
  { href: "/admin/yangiliklar", label: "Yangiliklar" },
  { href: "/admin/kategoriyalar", label: "Yo‘nalishlar" },
  { href: "/admin/kurslar", label: "Kurslar" },
  { href: "/admin/arizalar", label: "Arizalar" },
  { href: "/admin/foydalanuvchilar", label: "Foydalanuvchilar" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const u = await requireUser(["ADMIN"]);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="bg-ink text-white lg:sticky lg:top-0 lg:h-screen">
        <div className="flex items-center justify-between p-5 lg:block">
          <Link href="/"><Image src="/logo.png" alt="LOLAI" width={954} height={258} className="h-6 w-auto brightness-0 invert" /></Link>
          <div className="mt-0 font-mono text-[11px] uppercase tracking-widest text-orange lg:mt-3">Admin panel</div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1 lg:overflow-visible">
          {NAV.map((n) => <Link key={n.href} href={n.href} className="block shrink-0 rounded-xl px-3 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">{n.label}</Link>)}
        </nav>
        <div className="hidden border-t border-white/10 p-5 text-xs text-white/50 lg:absolute lg:bottom-0 lg:block lg:w-full">
          {u.firstName} {u.lastName}
          <div className="mt-3 flex gap-2">
            <Link href="/" className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10">Sayt</Link>
            <form action="/chiqish" method="post"><button className="rounded-full border border-white/20 px-3 py-1 hover:bg-white/10">Chiqish</button></form>
          </div>
        </div>
      </aside>
      <main className="relative isolate min-w-0 p-5 sm:p-8 lg:p-10"><Aurora variant="cool" className="!fixed opacity-40" />{children}</main>
    </div>
  );
}
