import Link from "next/link";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db, users } from "@/db";
import { createUser, updateUser } from "@/app/actions/admin";
import { AdminHead, Flash } from "@/components/AdminUi";
import { fmtDate, formatPhone, roleLabel } from "@/lib/utils";
import { Avatar } from "@/components/Avatar";

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string; rol?: string; ok?: string; err?: string }> }) {
  const sp = await searchParams;
  const rol = (["STUDENT", "TEACHER", "ADMIN"] as const).find((r) => r === sp.rol);
  const q = (sp.q || "").trim();
  const conds = [];
  if (rol) conds.push(eq(users.role, rol));
  if (q) conds.push(or(ilike(users.firstName, `%${q}%`), ilike(users.lastName, `%${q}%`), ilike(users.phone, `%${q.replace(/\D/g, "") || q}%`)));
  const list = await db.select().from(users).where(conds.length ? and(...conds) : undefined).orderBy(desc(users.createdAt)).limit(200);
  const back = `/admin/foydalanuvchilar${rol ? `?rol=${rol}` : ""}`;
  return (
    <div>
      <AdminHead title="Foydalanuvchilar" sub="Rolni o‘zgartirish, bloklash, parolni tiklash. O‘qituvchi hisobini shu yerda yarating." />
      <Flash sp={sp} />
      <details className="card mb-6 p-5">
        <summary className="cursor-pointer font-bold">+ Yangi foydalanuvchi (masalan, o‘qituvchi)</summary>
        <form action={createUser} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input name="firstName" required placeholder="Ism" className="input" />
          <input name="lastName" required placeholder="Familiya" className="input" />
          <input name="phone" required placeholder="Telefon: 90 123 45 67" className="input" />
          <input name="password" required placeholder="Parol (kamida 6 belgi)" className="input" />
          <select name="role" defaultValue="TEACHER" className="input"><option value="TEACHER">O‘qituvchi</option><option value="STUDENT">Talaba</option><option value="ADMIN">Admin</option></select>
          <button className="btn-primary">Yaratish</button>
        </form>
        <p className="mt-3 text-xs text-muted">Telefon va parolni o‘qituvchiga bering — u «Kirish» sahifasidan kiradi va profilida parolni o‘zgartirishi mumkin.</p>
      </details>
      <form className="mb-5 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Ism yoki telefon bo‘yicha qidirish" className="input max-w-xs" />
        <select name="rol" defaultValue={rol ?? ""} className="input max-w-[180px]"><option value="">Barcha rollar</option><option value="STUDENT">Talabalar</option><option value="TEACHER">O‘qituvchilar</option><option value="ADMIN">Adminlar</option></select>
        <button className="btn-dark">Qidirish</button>
        {(q || rol) && <Link href="/admin/foydalanuvchilar" className="btn-ghost">Tozalash</Link>}
      </form>
      <div className="card divide-y divide-line">
        {list.map((u) => (
          <form key={u.id} action={updateUser} className="flex flex-wrap items-center gap-3 p-4 text-sm">
            <input type="hidden" name="id" value={u.id} /><input type="hidden" name="back" value={back} />
            <Avatar src={u.avatarUrl} name={`${u.firstName} ${u.lastName}`} size={40} />
            <div className="min-w-[180px] flex-1">
              <div className="font-bold">{u.firstName} {u.lastName} {u.status === "BLOCKED" && <span className="chip ml-1 bg-red-100 text-red-700">bloklangan</span>}</div>
              <div className="font-mono text-xs text-muted">{formatPhone(u.phone)} · {u.district || u.region || "—"} · {fmtDate(u.createdAt)}</div>
            </div>
            <select name="role" defaultValue={u.role} className="input w-auto py-1.5">{Object.entries(roleLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select name="status" defaultValue={u.status} className="input w-auto py-1.5"><option value="ACTIVE">Faol</option><option value="BLOCKED">Bloklangan</option></select>
            <input name="newPassword" placeholder="Yangi parol (ixtiyoriy)" className="input w-44 py-1.5" />
            <button className="btn-dark btn-sm">Saqlash</button>
          </form>
        ))}
        {list.length === 0 && <div className="p-8 text-center text-muted">Topilmadi.</div>}
      </div>
    </div>
  );
}
