import Link from "next/link";
import { listCategories, listCourses } from "@/lib/queries";
import { CourseCard, Empty } from "@/components/Cards";

export const metadata = { title: "Kurslar" };

export default async function Courses({ searchParams }: { searchParams: Promise<{ yonalish?: string }> }) {
  const { yonalish } = await searchParams;
  const [cats, courses] = await Promise.all([listCategories(), listCourses({ categorySlug: yonalish })]);
  return (
    <div className="container-x py-14">
      <div className="kicker mb-3">Katalog</div>
      <h1 className="h-title">Kurslar</h1>
      <p className="mt-3 max-w-2xl text-muted">Onlayn darslar Google Meet orqali o‘tadi. Kursni tanlang, ariza qoldiring — ustoz tasdiqlagach kurs xonangiz ochiladi.</p>
      <div className="mt-8 flex flex-wrap gap-2">
        <Link href="/kurslar" className={`chip px-4 py-2 text-sm ${!yonalish ? "bg-ink text-white" : ""}`}>Barchasi</Link>
        {cats.map((c) => (
          <Link key={c.id} href={`/kurslar?yonalish=${c.slug}`} className={`chip px-4 py-2 text-sm ${yonalish === c.slug ? "bg-ink text-white" : ""}`}>{c.name}</Link>
        ))}
      </div>
      <div className="mt-8">
        {courses.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{courses.map((c) => <CourseCard key={c.id} c={c} />)}</div>
        ) : <Empty>Bu yo‘nalishda hozircha kurslar yo‘q.</Empty>}
      </div>
    </div>
  );
}
