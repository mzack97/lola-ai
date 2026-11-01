import { listCategories, listCourses } from "@/lib/queries";
import { CourseExplorer } from "@/components/CourseExplorer";
import { Aurora, Reveal, SplitHeadline } from "@/components/motion";

export const metadata = { title: "Kurslar" };

export default async function Courses({ searchParams }: { searchParams: Promise<{ yonalish?: string }> }) {
  const { yonalish } = await searchParams;
  const [cats, courses] = await Promise.all([listCategories(), listCourses()]);
  return (
    <div className="relative pb-16 pt-32">
      <Aurora variant="sunset" className="h-[70vh] opacity-80" />
      <div className="container-x">
        <div className="mb-12 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Reveal><div className="kicker mb-5"><span className="h-1.5 w-1.5 rounded-full bg-orange" />Katalog · {courses.length} ta kurs</div></Reveal>
            <SplitHeadline className="display text-[clamp(3rem,8vw,6rem)]" parts={[{ t: "Barcha" }, { t: "kurslar", accent: true }]} />
          </div>
          <Reveal delay={0.3}><p className="max-w-sm text-muted">Darslar Google Meet orqali jonli o‘tadi. Kursni tanlang, ariza qoldiring — ustoz tasdiqlagach kurs xonangiz ochiladi.</p></Reveal>
        </div>
        <CourseExplorer courses={courses} categories={cats} initial={yonalish ?? ""} />
      </div>
    </div>
  );
}
