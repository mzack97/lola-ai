import Image from "next/image";
import { Aurora, Reveal, SplitHeadline } from "./motion";

export function AuthShell({ title, accent, sub, children, side }: { title: string; accent: string; sub: string; children: React.ReactNode; side: "login" | "register" }) {
  const steps = side === "register"
    ? ["Hisob oching — 1 daqiqa", "Kursga ariza qoldiring", "Ustoz tasdiqlaydi", "Jonli darsga qo‘shiling"]
    : ["Kurs xonangiz", "Navbatdagi darslar", "Ustoz bilan chat", "Materiallar"];
  return (
    <div className="relative min-h-screen overflow-hidden pb-16 pt-28">
      <Aurora variant={side === "register" ? "sunset" : "warm"} />
      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_520px]">
        <div className="hidden lg:block">
          <SplitHeadline className="display text-[clamp(3rem,6vw,5.4rem)]" parts={[{ t: title }, { t: accent, accent: true }]} />
          <Reveal delay={0.3}><p className="mt-6 max-w-md text-lg text-ink-2">{sub}</p></Reveal>
          <div className="relative mt-12 h-72 max-w-md">
            {steps.map((s, i) => (
              <Reveal key={s} delay={0.4 + i * 0.12} className="absolute" y={20}>
                <div className="glass animate-floaty flex items-center gap-3 rounded-2xl px-5 py-4 text-sm font-bold" style={{ marginLeft: `${i * 48}px`, marginTop: `${i * 64}px`, animationDelay: `${-i * 1.5}s` }}>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-white">{i + 1}</span>{s}
                </div>
              </Reveal>
            ))}
            <Image src="/mark.png" alt="" width={256} height={256} className="animate-spin-slow absolute -right-6 bottom-0 h-28 w-28 opacity-90" />
          </div>
        </div>
        <Reveal y={40}>
          <div className="card !rounded-[36px] p-7 sm:p-10">
            <h1 className="display text-4xl lg:hidden">{title} <span className="serif-accent text-orange">{accent}</span></h1>
            <div className="display hidden text-3xl lg:block">{side === "register" ? "Ro‘yxatdan o‘tish" : "Kirish"}</div>
            <p className="mb-7 mt-2 text-sm text-muted">{side === "register" ? "Bepul. Bir daqiqada hisob oching." : "Telefon raqamingiz va parolingiz bilan kiring."}</p>
            {children}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
