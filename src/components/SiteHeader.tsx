import Link from "next/link";
import { Logo } from "./Logo";
import { getUser, homeFor } from "@/lib/auth";

const NAV = [
  { href: "/kurslar", label: "Kurslar" },
  { href: "/yangiliklar", label: "Yangiliklar" },
  { href: "/frilans", label: "Frilans" },
  { href: "/marketplace", label: "Marketplace" },
];

export async function SiteHeader() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-ink-2 transition hover:text-orange">{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href={homeFor(user)} className="btn-dark btn-sm">
                {user.role === "ADMIN" ? "Admin panel" : user.role === "TEACHER" ? "O‘qituvchi kabineti" : "Kabinet"}
              </Link>
              <form action="/chiqish" method="post">
                <button className="btn-ghost btn-sm">Chiqish</button>
              </form>
            </>
          ) : (
            <>
              <Link href="/kirish" className="btn-ghost btn-sm">Kirish</Link>
              <Link href="/royxat" className="btn-primary btn-sm hidden sm:inline-flex">Ro‘yxatdan o‘tish</Link>
            </>
          )}
          <details className="relative md:hidden">
            <summary className="btn-ghost btn-sm list-none">Menyu</summary>
            <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-line bg-white p-2 shadow-xl">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-paper">{n.label}</Link>
              ))}
              {!user && <Link href="/royxat" className="block rounded-xl px-3 py-2 text-sm font-bold text-orange hover:bg-paper">Ro‘yxatdan o‘tish</Link>}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
