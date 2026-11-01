import Link from "next/link";
import { getBlocks, getSettings, getTeam } from "@/lib/content";
import { listCategories, listCourses, listNews } from "@/lib/queries";
import { Empty, NewsCard, SectionHead } from "@/components/Cards";
import { CourseExplorer } from "@/components/CourseExplorer";
import { Aurora, Marquee, Reveal, ScrollWords, SplitHeadline, Stagger, StaggerItem, TiltCard } from "@/components/motion";
import { HeroVisual } from "@/components/home/HeroVisual";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Avatar } from "@/components/Avatar";

const DIRECTIONS = ["Dasturlash", "Grafik dizayn", "SMM", "Sun’iy intellekt", "Startaplar", "Frilans", "Ingliz tili", "UI/UX", "Tadbirkorlik", "Mobil ilovalar"];

export default async function Home() {
  const [b, s, team, cats, courses, news] = await Promise.all([getBlocks(), getSettings(), getTeam(), listCategories(), listCourses({ limit: 9 }), listNews(3)]);
  const words = b.hero.title.trim().split(" ");
  const accent = words.pop() ?? "";

  return (
    <>
      {/* ───────── HERO ───────── */}
      {b.hero.visible && (
        <section className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
          <Aurora variant="warm" />
          <div className="container-x grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <Reveal>
                <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold">
                  <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange opacity-70" /><span className="relative inline-flex h-2 w-2 rounded-full bg-orange" /></span>
                  Kurslarga qabul ochiq
                </span>
              </Reveal>
              <SplitHeadline delay={0.15} className="display mt-6 text-[clamp(2.8rem,6.2vw,5.6rem)]" parts={[{ t: words.join(" ") }, { t: accent, accent: true }]} />
              <Reveal delay={0.5}><p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">{b.hero.text}</p></Reveal>
              <Reveal delay={0.65}>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link href="/kurslar" className="btn-primary px-7 py-4 text-base">Kurslarni ko‘rish →</Link>
                  <Link href="/royxat" className="btn-ghost px-7 py-4 text-base">Ro‘yxatdan o‘tish</Link>
                </div>
              </Reveal>
              <Reveal delay={0.8}>
                <div className="mt-10 flex flex-wrap gap-6 text-sm font-semibold text-ink-2">
                  {["Onlayn darslar", "Tajribali ustozlar", "Amaliyot va ish"].map((t) => <span key={t} className="flex items-center gap-2"><span className="text-orange">✦</span>{t}</span>)}
                </div>
              </Reveal>
            </div>
            <HeroVisual />
          </div>
          <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[11px] font-bold uppercase tracking-[.3em] text-muted md:flex">
            Pastga
            <span className="h-10 w-6 rounded-full border-2 border-ink/20 p-1"><span className="block h-2 w-full animate-bounce rounded-full bg-orange" /></span>
          </div>
        </section>
      )}

      {/* ───────── CROSSING TICKERS ───────── */}
      <section className="relative z-10 -my-6 overflow-hidden py-10">
        <div className="-rotate-2 bg-ink py-5 text-white shadow-2xl">
          <Marquee items={DIRECTIONS.map((d) => <span key={d} className="display flex items-center gap-10 text-4xl sm:text-5xl">{d}<span className="text-orange">✦</span></span>)} />
        </div>
        <div className="-mt-3 rotate-1 bg-orange py-3 text-white">
          <Marquee reverse items={["Ro‘yxatdan o‘ting", "Ariza qoldiring", "Darsga qo‘shiling", "Kasb egallang"].map((d) => <span key={d} className="flex items-center gap-10 font-mono text-sm font-bold uppercase tracking-[.25em]">{d}<span>●</span></span>)} />
        </div>
      </section>

      {/* ───────── HOW IT WORKS (pinned horizontal) ───────── */}
      <HowItWorks />

      {/* ───────── COURSES ───────── */}
      <section className="relative py-24">
        <Aurora variant="cool" className="opacity-60" />
        <div className="container-x">
          <Reveal><SectionHead kicker="Kurslar" title="Yo‘nalishni tanlang," accent="boshlang" action={<Link href="/kurslar" className="btn-ghost">Barcha kurslar →</Link>} /></Reveal>
          {courses.length ? <CourseExplorer courses={courses} categories={cats} search={false} syncUrl={false} sticky={false} /> : <Empty>Kurslar tez orada e’lon qilinadi.</Empty>}
        </div>
      </section>

      {/* ───────── ABOUT (scroll-lit text) ───────── */}
      {b.about.visible && (
        <section className="relative overflow-hidden bg-ink py-32 text-white">
          <Aurora variant="night" className="opacity-60" />
          <div className="container-x">
            <div className="kicker mb-8"><span className="h-1.5 w-1.5 rounded-full bg-orange" />{b.about.title}</div>
            <ScrollWords text={b.about.text.split("\n")[0]} className="display max-w-5xl text-[clamp(1.9rem,4.2vw,3.6rem)] leading-[1.08]" />
            {b.about.text.split("\n").slice(1).join(" ").trim() && (
              <Reveal><p className="mt-12 max-w-2xl text-lg leading-8 text-white/60">{b.about.text.split("\n").slice(1).join(" ").trim()}</p></Reveal>
            )}
          </div>
        </section>
      )}

      {/* ───────── COMING SOON ───────── */}
      <section className="container-x grid gap-6 py-24 md:grid-cols-2">
        {(["freelance", "marketplace"] as const).filter((k) => b[k].visible).map((k, i) => (
          <Reveal key={k} delay={i * 0.12}>
            <TiltCard className="h-full rounded-[36px]">
              <Link href={k === "freelance" ? "/frilans" : "/marketplace"} className={`relative flex h-full min-h-[320px] flex-col justify-between overflow-hidden rounded-[36px] p-9 ${i ? "glass" : "glass-dark text-white"}`}>
                <div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl ${i ? "bg-peach/70" : "bg-orange/50"}`} />
                <div className="relative flex items-center justify-between">
                  <span className="chip bg-orange text-white ring-0">Tez kunda</span>
                  <span className="font-mono text-xs opacity-60">0{i + 1}</span>
                </div>
                <div className="relative">
                  <h3 className="display text-5xl sm:text-6xl">{b[k].title}</h3>
                  <p className={`mt-4 max-w-md ${i ? "text-muted" : "text-white/65"}`}>{b[k].text}</p>
                </div>
              </Link>
            </TiltCard>
          </Reveal>
        ))}
      </section>

      {/* ───────── NEWS ───────── */}
      <section className="container-x py-16">
        <Reveal><SectionHead kicker="Yangiliklar" title="So‘nggi" accent="xabarlar" action={<Link href="/yangiliklar" className="btn-ghost">Barchasi →</Link>} /></Reveal>
        {news.length ? (
          <Stagger className="grid gap-5 md:grid-cols-3">{news.map((n) => <StaggerItem key={n.id}><NewsCard n={n} /></StaggerItem>)}</Stagger>
        ) : <Empty>Hozircha yangiliklar yo‘q.</Empty>}
      </section>

      {/* ───────── TEAM ───────── */}
      {team.length > 0 && (
        <section className="container-x py-16">
          <Reveal><SectionHead kicker="Jamoa" title="Loyihani yaratganlar" /></Reveal>
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <StaggerItem key={m.id}>
                <TiltCard className="rounded-[32px]">
                  <div className="card flex flex-col items-center p-8 text-center">
                    <Avatar src={m.photoUrl} name={m.name} size={112} className="!ring-4 shadow-xl" />
                    <div className="mt-5 font-display text-xl font-bold">{m.name}</div>
                    <div className="mt-1 text-sm text-muted">{m.role}</div>
                  </div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {/* ───────── CTA + CONTACTS ───────── */}
      <section className="container-x py-16">
        <Reveal>
          <div className="relative overflow-hidden rounded-[44px] bg-orange p-10 text-white sm:p-16">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 h-96 w-96 rounded-full bg-ink/30 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
              <div>
                <h2 className="display text-[clamp(2.6rem,6vw,5rem)]">Bugun boshlang — <span className="serif-accent">ertaga kasb egasi</span></h2>
                <Link href="/royxat" className="btn mt-8 bg-white px-8 py-4 text-base text-ink hover:-translate-y-0.5">Ro‘yxatdan o‘tish →</Link>
              </div>
              {b.contacts.visible && (
                <div className="glass-dark space-y-3 rounded-[28px] p-6 text-sm">
                  <div className="font-display text-lg font-bold">{b.contacts.title}</div>
                  <p className="text-white/60">{b.contacts.text}</p>
                  {s.phone && <div className="flex justify-between border-t border-white/10 pt-3"><span className="text-white/50">Telefon</span><b>{s.phone}</b></div>}
                  {s.telegram && <div className="flex justify-between border-t border-white/10 pt-3"><span className="text-white/50">Telegram</span><a href={s.telegram} target="_blank" rel="noreferrer" className="font-bold text-peach">Yozish ↗</a></div>}
                  {s.address && <div className="flex justify-between border-t border-white/10 pt-3"><span className="text-white/50">Manzil</span><b className="text-right">{s.address}</b></div>}
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
