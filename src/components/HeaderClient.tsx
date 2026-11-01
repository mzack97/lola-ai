"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Avatar } from "./Avatar";

const NAV = [
  { href: "/kurslar", label: "Kurslar" },
  { href: "/yangiliklar", label: "Yangiliklar" },
  { href: "/frilans", label: "Frilans" },
  { href: "/marketplace", label: "Marketplace" },
];
type U = { firstName: string; lastName: string; avatarUrl: string | null; role: string } | null;

export function HeaderClient({ user, home }: { user: U; home: string }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(v > 24);
    setHidden(v > 400 && v > prev && !open);
  });
  useEffect(() => setOpen(false), [path]);

  return (
    <>
      <motion.header animate={{ y: hidden ? -110 : 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div className={`mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full px-3 py-2 transition-all duration-500 sm:px-4 glass ${scrolled ? "shadow-xl" : ""}`}>
          <Link href="/" aria-label="LOLA AI" className="flex items-center pl-2">
            <Image src="/logo.png" alt="LOLAI" width={954} height={258} priority className="h-6 w-auto sm:h-7" />
          </Link>
          <nav className="hidden items-center rounded-full p-1 md:flex">
            {NAV.map((n) => {
              const active = path.startsWith(n.href);
              return (
                <Link key={n.href} href={n.href} className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${active ? "text-white" : "text-ink-2 hover:text-orange"}`}>
                  {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-ink" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link href={home} className="btn-ghost btn-sm !py-1 !pl-1 !pr-3.5">
                  <Avatar src={user.avatarUrl} name={`${user.firstName} ${user.lastName}`} size={28} />
                  <span className="hidden sm:inline">{user.role === "ADMIN" ? "Admin" : user.role === "TEACHER" ? "Kabinet" : user.firstName}</span>
                </Link>
                <form action="/chiqish" method="post" className="hidden sm:block"><button className="btn-ghost btn-sm">Chiqish</button></form>
              </>
            ) : (
              <>
                <Link href="/kirish" className="btn-ghost btn-sm hidden sm:inline-flex">Kirish</Link>
                <Link href="/royxat" className="btn-primary btn-sm">Ro‘yxatdan o‘tish</Link>
              </>
            )}
            <button onClick={() => setOpen((o) => !o)} aria-label="Menyu" className="btn-ghost btn-sm !px-3 md:hidden">
              <span className="relative block h-3 w-4">
                <span className={`absolute left-0 top-0 h-0.5 w-4 bg-ink transition ${open ? "translate-y-[5px] rotate-45" : ""}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 w-4 bg-ink transition ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-paper/70 backdrop-blur-2xl md:hidden">
            <motion.nav initial="h" animate="s" exit="h" variants={{ h: {}, s: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }} className="flex h-full flex-col justify-center gap-2 px-8">
              {[...NAV, ...(user ? [{ href: home, label: "Kabinet" }] : [{ href: "/kirish", label: "Kirish" }])].map((n) => (
                <motion.div key={n.href} variants={{ h: { opacity: 0, y: 30 }, s: { opacity: 1, y: 0 } }}>
                  <Link href={n.href} className="display block py-2 text-5xl">{n.label}</Link>
                </motion.div>
              ))}
              {user && (
                <motion.form variants={{ h: { opacity: 0 }, s: { opacity: 1 } }} action="/chiqish" method="post" className="mt-6"><button className="btn-ghost">Chiqish</button></motion.form>
              )}
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
