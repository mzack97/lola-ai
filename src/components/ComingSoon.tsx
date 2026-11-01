import Link from "next/link";
import { getBlocks } from "@/lib/content";

export async function ComingSoon({ k }: { k: "freelance" | "marketplace" }) {
  const b = (await getBlocks())[k];
  return (
    <div className="container-x py-24">
      <div className="mx-auto max-w-2xl text-center">
        <span className="chip bg-orange px-4 py-1.5 text-white">Tez kunda</span>
        <h1 className="mt-6 text-5xl font-extrabold tracking-tight">{b.title}</h1>
        <p className="mt-5 text-lg text-muted">{b.text}</p>
        <p className="mt-2 font-mono text-sm text-muted">&gt; bo‘lim ishlab chiqilmoqda<span className="ml-1 inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-orange" /></p>
        <div className="mt-10 flex justify-center gap-3">
          <Link href="/kurslar" className="btn-primary">Hozircha kurslarni ko‘ring</Link>
          <Link href="/royxat" className="btn-ghost">Ro‘yxatdan o‘tish</Link>
        </div>
      </div>
    </div>
  );
}
