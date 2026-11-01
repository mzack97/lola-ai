import { listNews } from "@/lib/queries";
import { Empty, NewsCard } from "@/components/Cards";

export const metadata = { title: "Yangiliklar" };

export default async function NewsList() {
  const news = await listNews();
  return (
    <div className="container-x py-14">
      <div className="kicker mb-3">Yangiliklar</div>
      <h1 className="h-title">So‘nggi xabarlar</h1>
      <div className="mt-10">
        {news.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{news.map((n) => <NewsCard key={n.id} n={n} />)}</div> : <Empty>Hozircha yangiliklar yo‘q.</Empty>}
      </div>
    </div>
  );
}
