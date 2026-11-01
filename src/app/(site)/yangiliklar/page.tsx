import { listNews } from "@/lib/queries";
import { Empty, NewsCard } from "@/components/Cards";
import { Aurora, Reveal, SplitHeadline, Stagger, StaggerItem } from "@/components/motion";

export const metadata = { title: "Yangiliklar" };

export default async function NewsList() {
  const news = await listNews();
  const [first, ...rest] = news;
  return (
    <div className="relative pb-16 pt-32">
      <Aurora variant="cool" className="h-[70vh]" />
      <div className="container-x">
        <Reveal><div className="kicker mb-5"><span className="h-1.5 w-1.5 rounded-full bg-orange" />Jurnal</div></Reveal>
        <SplitHeadline className="display text-[clamp(3rem,8vw,6rem)]" parts={[{ t: "Yangiliklar va" }, { t: "voqealar", accent: true }]} />
        <div className="mt-14">
          {!first ? <Empty>Hozircha yangiliklar yo‘q.</Empty> : (
            <>
              <Reveal><NewsCard n={first} big /></Reveal>
              {rest.length > 0 && <Stagger className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.map((n) => <StaggerItem key={n.id}><NewsCard n={n} /></StaggerItem>)}</Stagger>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
