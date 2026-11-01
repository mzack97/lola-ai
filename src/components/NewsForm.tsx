import type { InferSelectModel } from "drizzle-orm";
import type { news } from "@/db";
import { saveNews } from "@/app/actions/admin";
import { Check, Field } from "./AdminUi";
import { ImageCropInput } from "./ImageCropInput";

export function NewsForm({ n }: { n?: InferSelectModel<typeof news> }) {
  return (
    <form action={saveNews} className="card max-w-3xl space-y-4 p-6">
      {n && <input type="hidden" name="id" value={n.id} />}
      <Field label="Sarlavha"><input name="title" required defaultValue={n?.title} className="input" /></Field>
      <Field label="Qisqa matn" hint="Ro‘yxatda ko‘rinadigan 1–2 gap"><textarea name="excerpt" rows={2} defaultValue={n?.excerpt} className="input" /></Field>
      <Field label="To‘liq matn"><textarea name="body" rows={14} defaultValue={n?.body} className="input" /></Field>
      <ImageCropInput name="cover" aspect={16 / 9} outWidth={1600} current={n?.coverUrl} label="Rasm" preview="card" />
      {n?.coverUrl && <Check name="removeCover" label="Joriy rasmni olib tashlash" />}
      <Check name="published" label="Saytda nashr etish" defaultChecked={n?.published} />
      <button className="btn-primary">Saqlash</button>
    </form>
  );
}
