import { listCategories } from "@/lib/queries";
import { deleteCategory, saveCategory } from "@/app/actions/admin";
import { AdminHead, ConfirmButton, Flash } from "@/components/AdminUi";

export default async function Cats({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  const cats = await listCategories();
  return (
    <div className="max-w-3xl">
      <AdminHead title="Yo‘nalishlar" sub="Kurslar katalogidagi filtrlar: IT, Dizayn, Biznes…" />
      <Flash sp={sp} />
      <form action={saveCategory} className="card mb-6 flex flex-wrap items-end gap-3 p-4">
        <div className="flex-1"><label className="label">Yangi yo‘nalish</label><input name="name" required className="input" placeholder="Masalan: Dizayn" /></div>
        <div className="w-24"><label className="label">Tartib</label><input name="order" type="number" defaultValue={cats.length} className="input" /></div>
        <button className="btn-primary">Qo‘shish</button>
      </form>
      <div className="card divide-y divide-line">
        {cats.map((c) => (
          <div key={c.id} className="flex flex-wrap items-end gap-3 p-4">
            <form action={saveCategory} className="flex flex-1 flex-wrap items-end gap-3">
              <input type="hidden" name="id" value={c.id} />
              <div className="flex-1"><input name="name" defaultValue={c.name} className="input" /></div>
              <div className="w-24"><input name="order" type="number" defaultValue={c.order} className="input" /></div>
              <button className="btn-dark btn-sm mb-1.5">Saqlash</button>
            </form>
            <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><ConfirmButton>O‘chirish</ConfirmButton></form>
          </div>
        ))}
        {cats.length === 0 && <div className="p-6 text-center text-sm text-muted">Hali yo‘nalish yo‘q.</div>}
      </div>
    </div>
  );
}
