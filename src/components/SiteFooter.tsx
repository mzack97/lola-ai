import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/lib/content";

export async function SiteFooter() {
  const s = await getSettings();
  return (
    <footer className="relative mt-32 overflow-hidden bg-ink text-white">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[80%] -translate-x-1/2 rounded-full bg-orange/30 blur-3xl" />
      <div className="container-x relative grid gap-12 pt-20 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <h3 className="display text-4xl sm:text-5xl">Kelajak kasblari <span className="serif-accent text-orange">sizni kutmoqda</span></h3>
          <Link href="/royxat" className="btn-primary mt-8">Hoziroq boshlash →</Link>
        </div>
        <div className="text-sm">
          <div className="kicker mb-5">Bo‘limlar</div>
          <ul className="space-y-3 text-white/70">
            {[["/kurslar", "Kurslar"], ["/yangiliklar", "Yangiliklar"], ["/frilans", "Frilans"], ["/marketplace", "Marketplace"]].map(([h, l]) => (
              <li key={h}><Link href={h} className="transition hover:text-white">{l}</Link></li>
            ))}
          </ul>
        </div>
        <div className="text-sm">
          <div className="kicker mb-5">Aloqa</div>
          <ul className="space-y-3 text-white/70">
            {s.phone && <li>{s.phone}</li>}
            {s.email && <li>{s.email}</li>}
            {s.telegram && <li><a href={s.telegram} className="hover:text-white" target="_blank" rel="noreferrer">Telegram ↗</a></li>}
            {s.instagram && <li><a href={s.instagram} className="hover:text-white" target="_blank" rel="noreferrer">Instagram ↗</a></li>}
            {s.address && <li>{s.address}</li>}
          </ul>
        </div>
      </div>
      <div className="relative mt-16 select-none overflow-hidden">
        <Image src="/logo.png" alt="" width={954} height={258} className="mx-auto w-[92%] max-w-none translate-y-[18%] opacity-[.07] brightness-0 invert" />
      </div>
      <div className="relative border-t border-white/10 py-5 text-center font-mono text-[11px] tracking-wider text-white/40">
        © {new Date().getFullYear()} LOLA AI · Namangan viloyati sun’iy intellekt bo‘yicha maslahatchilari jamoasi loyihasi
      </div>
    </footer>
  );
}
