"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction, registerAction, type FormState } from "@/app/actions/auth";
import { NAMANGAN_DISTRICTS, REGIONS } from "@/lib/regions";
import { ImageCropInput } from "./ImageCropInput";

export function FormError({ state }: { state: FormState }) {
  if (!state?.error && !state?.ok) return null;
  return <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${state.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{state.error || state.ok}</div>;
}

function PhoneInput() {
  return (
    <div className="flex">
      <span className="inline-flex items-center rounded-l-xl border border-r-0 border-line bg-[#f6f3f0] px-3 text-sm font-bold text-muted">+998</span>
      <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="90 123 45 67" className="input rounded-l-none" />
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next || ""} />
      <div><label className="label">Telefon raqam</label><PhoneInput /></div>
      <div><label className="label">Parol</label><input name="password" type="password" required autoComplete="current-password" className="input" /></div>
      <FormError state={state} />
      <button disabled={pending} className="btn-primary w-full py-3">{pending ? "Kirilmoqda…" : "Kirish"}</button>
      <p className="text-center text-sm text-muted">Hisobingiz yo‘qmi? <Link href={`/royxat${next ? `?next=${next}` : ""}`} className="font-bold text-orange">Ro‘yxatdan o‘ting</Link></p>
      <p className="text-center text-xs text-muted">Parolni unutdingizmi? Administratorga murojaat qiling — u parolni tiklab beradi.</p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(registerAction, undefined);
  const [region, setRegion] = useState("Namangan viloyati");
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next || ""} />
      <ImageCropInput name="avatar" aspect={1} outWidth={400} round label="Profil rasmi (ixtiyoriy)" preview="avatar" hint="Xohlasangiz, rasmingizni qo‘shing — keyin ham qo‘shish mumkin." />
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Ism</label><input name="firstName" required autoComplete="given-name" className="input" /></div>
        <div><label className="label">Familiya</label><input name="lastName" required autoComplete="family-name" className="input" /></div>
      </div>
      <div><label className="label">Telefon raqam</label><PhoneInput /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Tug‘ilgan sana</label><input name="birthDate" type="date" className="input" /></div>
        <div>
          <label className="label">Hudud</label>
          <select name="region" value={region} onChange={(e) => setRegion(e.target.value)} className="input">
            {REGIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Tuman / shahar</label>
        {region === "Namangan viloyati" ? (
          <select name="district" className="input" defaultValue="">
            <option value="" disabled>Tanlang</option>
            {NAMANGAN_DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        ) : <input name="district" className="input" placeholder="Tuman yoki shahar nomi" />}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Parol</label><input name="password" type="password" required minLength={6} autoComplete="new-password" className="input" /></div>
        <div><label className="label">Parolni takrorlang</label><input name="password2" type="password" required minLength={6} autoComplete="new-password" className="input" /></div>
      </div>
      <FormError state={state} />
      <button disabled={pending} className="btn-primary w-full py-3">{pending ? "Yuborilmoqda…" : "Ro‘yxatdan o‘tish"}</button>
      <p className="text-center text-sm text-muted">Hisobingiz bormi? <Link href={`/kirish${next ? `?next=${next}` : ""}`} className="font-bold text-orange">Kirish</Link></p>
    </form>
  );
}
