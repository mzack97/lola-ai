import type { InferSelectModel } from "drizzle-orm";
import type { news } from "@/db";
import { saveNews } from "@/app/actions/admin";
import { Check, Field } from "./AdminUi";

export function NewsForm({ n }: { n?: InferSelectModel<typeof news> }) {
  return (
    <form action={saveNews} className="card max-w-3xl space-y-4 p-6">
      {n && <input type="hidden" name="id" value={n.id} />}
      <Field label="Sarlavha"><input name="title" required defaultValue={n?.title} className="input" /></Field>
      <Field label="Qisqa matn" hint="Ro‘yxatda ko‘rinadigan 1–2 gap"><textarea name="excerpt" rows={2} defaultValue={n?.excerpt} className="input" /></Field>
      <Field label="To‘liq matn"><textarea name="body" rows={14} defaultValue={n?.body} className="input" /></Field>
      <Field label="Rasm"><input name="cover" type="file" accept="image/*" className="input py-2" /></Field>
      {n?.coverUrl && (<div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={n.coverUrl} alt="" className="h-20 rounded-lg" /><Check name="removeCover" label="Rasmni olib tashlash" /></div>)}
      <Check name="published" label="Saytda nashr etish" defaultChecked={n?.published} />
      <button className="btn-primary">Saqlash</button>
    </form>
  );
}
