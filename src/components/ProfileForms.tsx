"use client";
import { useActionState } from "react";
import { changePassword, saveProfile } from "@/app/actions/profile";
import { FormError } from "./AuthForms";
import { REGIONS } from "@/lib/regions";
import { ImageCropInput } from "./ImageCropInput";

type P = { firstName: string; lastName: string; region: string | null; district: string | null; phone: string; avatarUrl: string | null };

export function ProfileForms({ u }: { u: P }) {
  const [s1, a1, p1] = useActionState(saveProfile, undefined);
  const [s2, a2, p2] = useActionState(changePassword, undefined);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={a1} className="card space-y-4 p-6">
        <h2 className="display text-2xl">Shaxsiy ma’lumotlar</h2>
        <ImageCropInput name="avatar" aspect={1} outWidth={400} round current={u.avatarUrl} label="Profil rasmi" preview="avatar" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Ism</label><input name="firstName" defaultValue={u.firstName} className="input" /></div>
          <div><label className="label">Familiya</label><input name="lastName" defaultValue={u.lastName} className="input" /></div>
        </div>
        <div><label className="label">Telefon (login)</label><input value={u.phone} disabled className="input bg-paper" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Hudud</label><select name="region" defaultValue={u.region ?? ""} className="input"><option value="">—</option>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select></div>
          <div><label className="label">Tuman</label><input name="district" defaultValue={u.district ?? ""} className="input" /></div>
        </div>
        <FormError state={s1} />
        <button disabled={p1} className="btn-dark">Saqlash</button>
      </form>
      <form action={a2} className="card space-y-4 p-6">
        <h2 className="display text-2xl">Parolni o‘zgartirish</h2>
        <div><label className="label">Joriy parol</label><input name="current" type="password" className="input" /></div>
        <div><label className="label">Yangi parol</label><input name="password" type="password" className="input" /></div>
        <div><label className="label">Yangi parolni takrorlang</label><input name="password2" type="password" className="input" /></div>
        <FormError state={s2} />
        <button disabled={p2} className="btn-dark">O‘zgartirish</button>
      </form>
    </div>
  );
}
