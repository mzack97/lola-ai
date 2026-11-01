import Link from "next/link";
import { listCourses } from "@/lib/queries";
import { AdminHead, Flash } from "@/components/AdminUi";
import { fmtDate } from "@/lib/utils";

export default async function AdminCourses({ searchParams }: { searchParams: Promise<{ ok?: string }> }) {
  const sp = await searchParams;
  const list = await listCourses({ onlyPublished: false });
  return (
    <div>
      <AdminHead title="Kurslar" sub="Kurs yarating, ustoz biriktiring va nashr eting" action={<Link href="/admin/kurslar/yangi" className="btn-primary">+ Yangi kurs</Link>} />
      <Flash sp={sp} />
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
            <tr><th className="p-3">Kurs</th><th className="p-3">Yo‘nalish</th><th className="p-3">Ustoz</th><th className="p-3">Talabalar</th><th className="p-3">Boshlanish</th><th className="p-3">Holat</th><th className="p-3"></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((c) => (
              <tr key={c.id}>
                <td className="p-3 font-bold">{c.title}</td>
                <td className="p-3 text-muted">{c.category ?? "—"}</td>
                <td className="p-3">{c.teachers.join(", ") || <span className="font-semibold text-orange">biriktirilmagan</span>}</td>
                <td className="p-3">{c.approved} / {c.capacity}</td>
                <td className="p-3 text-muted">{fmtDate(c.startDate) || "E’lon qilinadi"}</td>
                <td className="p-3">{c.published ? <span className="chip bg-green-100 text-green-800">Nashr etilgan</span> : <span className="chip">Qoralama</span>}</td>
                <td className="p-3 text-right"><div className="flex justify-end gap-2"><Link href={`/xona/${c.id}`} className="btn-ghost btn-sm">Xona</Link><Link href={`/admin/kurslar/${c.id}`} className="btn-dark btn-sm">Tahrirlash</Link></div></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-muted">Hali kurs yo‘q.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
