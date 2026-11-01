import Link from "next/link";
import Image from "next/image";
import { getBlocks, getSettings, getTeam } from "@/lib/content";
import { listCategories, listCourses, listNews } from "@/lib/queries";
import { CourseCard, Empty, NewsCard, SectionHead } from "@/components/Cards";

const ORBIT = ["IT", "Dizayn", "Startap", "Frilans", "AI", "Biznes", "SMM", "Tillar"];

export default async function Home() {
  const [b, s, team, cats, courses, news] = await Promise.all([
    getBlocks(), getSettings(), getTeam(), listCategories(), listCourses({ limit: 6 }), listNews(3),
  ]);

  return (
    <>
      {/* HERO */}
      {b.hero.visible && (
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(18,18,18,.08)_1px,transparent_1.4px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_70%_40%,#000_20%,transparent_70%)]" />
          <div className="pointer-events-none absolute -right-40 -top-40 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle,rgba(251,235,221,1),transparent_65%)]" />
          <div className="container-x relative grid items-center gap-12 py-16 md:grid-cols-[1.1fr_.9fr] md:py-24">
            <div>
              <div className="kicker mb-5">&gt; lola_ai://start</div>
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
                {b.hero.title.split(" ").map((w, i, a) => (
                  <span key={i} className={i >= a.length - 2 ? "text-orange" : ""}>{w} </span>
                ))}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-ink-2">{b.hero.text}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/kurslar" className="btn-primary px-7 py-3.5 text-base">Kurslarni ko‘rish</Link>
                <Link href="/royxat" className="btn-ghost px-7 py-3.5 text-base">Ro‘yxatdan o‘tish</Link>
              </div>
            </div>
            <div className="relative mx-auto aspect-square w-full max-w-[440px]">
              <div className="absolute inset-[6%] rounded-full border border-dashed border-ink/15 animate-[spin_60s_linear_infinite]" />
              <div className="absolute inset-[18%] rounded-full border border-orange/30" />
              <div className="absolute inset-[30%] rounded-full bg-white shadow-[0_30px_60px_-20px_rgba(255,83,30,.35)]" />
              <Image src="/mark.png" alt="" width={256} height={256} className="absolute inset-[36%] h-[28%] w-[28%] animate-[spin_24s_linear_infinite]" />
              {ORBIT.map((t, i) => {
                const a = (i / ORBIT.length) * Math.PI * 2 - Math.PI / 2;
                return (
                  <span key={t} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold shadow-sm"
                    style={{ left: `${50 + Math.cos(a) * 44}%`, top: `${50 + Math.sin(a) * 44}%` }}>
                    {i % 3 === 0 && <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-orange align-middle" />}{t}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* COURSES */}
      <section className="container-x py-16">
        <SectionHead kicker="Kurslar" title="Yo‘nalishni tanlang" action={<Link href="/kurslar" className="btn-ghost">Barcha kurslar →</Link>} />
        {cats.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            {cats.map((c) => <Link key={c.id} href={`/kurslar?yonalish=${c.slug}`} className="chip px-4 py-2 text-sm hover:bg-orange hover:text-white">{c.name}</Link>)}
          </div>
        )}
        {courses.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.map((c) => <CourseCard key={c.id} c={c} />)}</div>
        ) : <Empty>Kurslar tez orada e’lon qilinadi.</Empty>}
      </section>

      {/* ABOUT */}
      {b.about.visible && (
        <section className="container-x py-16">
          <div className="grid gap-10 rounded-[2rem] bg-ink p-8 text-white sm:p-14 md:grid-cols-[.8fr_1.2fr]">
            <div>
              <div className="kicker mb-4">Loyiha</div>
              <h2 className="h-title">{b.about.title}</h2>
            </div>
            <div className="whitespace-pre-line text-[15px] leading-7 text-white/75">{b.about.text}</div>
          </div>
        </section>
      )}

      {/* COMING SOON */}
      <section className="container-x grid gap-6 py-16 md:grid-cols-2">
        {(["freelance", "marketplace"] as const).filter((k) => b[k].visible).map((k) => (
          <Link key={k} href={k === "freelance" ? "/frilans" : "/marketplace"} className="card group relative overflow-hidden p-8 sm:p-10">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cream transition group-hover:scale-125" />
            <span className="chip relative bg-orange text-white">Tez kunda</span>
            <h3 className="relative mt-5 text-2xl font-extrabold">{b[k].title}</h3>
            <p className="relative mt-3 max-w-md text-muted">{b[k].text}</p>
          </Link>
        ))}
      </section>

      {/* NEWS */}
      <section className="container-x py-16">
        <SectionHead kicker="Yangiliklar" title="So‘nggi xabarlar" action={<Link href="/yangiliklar" className="btn-ghost">Barchasi →</Link>} />
        {news.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} n={n} />)}</div>
        ) : <Empty>Hozircha yangiliklar yo‘q.</Empty>}
      </section>

      {/* TEAM */}
      {team.length > 0 && (
        <section className="container-x py-16">
          <SectionHead kicker="Jamoa" title="Loyiha jamoasi" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <div key={m.id} className="card p-6 text-center">
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-cream">
                  {m.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.photoUrl} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl font-extrabold text-orange">{m.name.charAt(0)}</div>
                  )}
                </div>
                <div className="mt-4 font-extrabold">{m.name}</div>
                <div className="mt-1 text-sm text-muted">{m.role}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACTS */}
      {b.contacts.visible && (
        <section className="container-x py-16">
          <div className="card grid gap-8 p-8 sm:p-12 md:grid-cols-2">
            <div>
              <div className="kicker mb-3">Aloqa</div>
              <h2 className="h-title">{b.contacts.title}</h2>
              <p className="mt-4 text-muted">{b.contacts.text}</p>
            </div>
            <div className="space-y-3 self-center text-sm">
              {s.phone && <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Telefon</span><span className="font-bold">{s.phone}</span></div>}
              {s.telegram && <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">Telegram</span><a href={s.telegram} className="font-bold text-orange">Yozish →</a></div>}
              {s.email && <div className="flex justify-between border-b border-line pb-3"><span className="text-muted">E-mail</span><span className="font-bold">{s.email}</span></div>}
              {s.address && <div className="flex justify-between"><span className="text-muted">Manzil</span><span className="font-bold text-right">{s.address}</span></div>}
              {!s.phone && !s.telegram && !s.email && !s.address && <div className="text-muted">Aloqa ma’lumotlari admin paneldan qo‘shiladi.</div>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
