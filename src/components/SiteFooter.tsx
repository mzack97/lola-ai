import Link from "next/link";
import Image from "next/image";
import { getSettings } from "@/lib/content";

export async function SiteFooter() {
  const s = await getSettings();
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-3">
        <div>
          <Image src="/logo.png" alt="LOLAI" width={954} height={258} className="h-7 w-auto brightness-0 invert" />
          <p className="mt-4 max-w-xs text-sm leading-6 text-white/60">
            Kelajak kasblari uchun imkoniyat. Namangan viloyati sun’iy intellekt bo‘yicha maslahatchilari jamoasi loyihasi.
          </p>
        </div>
        <div className="text-sm">
          <div className="kicker mb-4">Bo‘limlar</div>
          <ul className="space-y-2">
            <li><Link href="/kurslar" className="hover:text-white">Kurslar</Link></li>
            <li><Link href="/yangiliklar" className="hover:text-white">Yangiliklar</Link></li>
            <li><Link href="/frilans" className="hover:text-white">Frilans</Link></li>
            <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="kicker mb-4">Aloqa</div>
          <ul className="space-y-2">
            {s.phone && <li>{s.phone}</li>}
            {s.email && <li>{s.email}</li>}
            {s.telegram && <li><a href={s.telegram} className="hover:text-white" target="_blank" rel="noreferrer">Telegram</a></li>}
            {s.instagram && <li><a href={s.instagram} className="hover:text-white" target="_blank" rel="noreferrer">Instagram</a></li>}
            {s.address && <li className="text-white/60">{s.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center font-mono text-xs text-white/40">© {new Date().getFullYear()} LOLA AI · lola-ai.uz</div>
    </footer>
  );
}
