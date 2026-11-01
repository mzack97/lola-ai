import { getBlocks, getSettings, getTeam, SETTING_KEYS } from "@/lib/content";
import { deleteTeamMember, saveBlock, saveSettings, saveTeamMember } from "@/app/actions/admin";
import { AdminHead, Check, ConfirmButton, Field, Flash } from "@/components/AdminUi";
import { ImageCropInput } from "@/components/ImageCropInput";

const LABELS: Record<string, string> = { hero: "Bosh banner (hero)", about: "Loyiha haqida", freelance: "Frilans (tez kunda)", marketplace: "Marketplace (tez kunda)", contacts: "Aloqa bloki" };

export default async function LandingAdmin({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const [b, s, team] = await Promise.all([getBlocks(), getSettings(), getTeam()]);
  return (
    <div className="max-w-4xl">
      <AdminHead title="Bosh sahifa bloklari" sub="Bosh sahifadagi matnlar, jamoa va aloqa ma’lumotlari" />
      <Flash sp={await searchParams} />
      <div className="space-y-6">
        {Object.keys(LABELS).map((k) => (
          <form key={k} id={k} action={saveBlock} className="card space-y-4 p-6">
            <input type="hidden" name="key" value={k} />
            <div className="flex items-center justify-between"><h2 className="font-extrabold">{LABELS[k]}</h2><Check name="visible" label="Ko‘rinadi" defaultChecked={b[k].visible} /></div>
            <Field label="Sarlavha"><input name="title" defaultValue={b[k].title} className="input" /></Field>
            <Field label="Matn"><textarea name="text" rows={k === "about" ? 7 : 3} defaultValue={b[k].text} className="input" /></Field>
            <button className="btn-dark btn-sm">Saqlash</button>
          </form>
        ))}

        <div id="team" className="card space-y-4 p-6">
          <h2 className="font-extrabold">Loyiha jamoasi</h2>
          {team.map((m) => (
            <div key={m.id} className="flex flex-wrap items-end gap-3 border-b border-line pb-4">
              <form action={saveTeamMember} className="flex flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={m.id} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.photoUrl ? <img src={m.photoUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream font-extrabold text-orange">{m.name[0]}</div>}
                <div className="min-w-[160px] flex-1"><label className="label">Ism</label><input name="name" defaultValue={m.name} className="input" /></div>
                <div className="min-w-[160px] flex-1"><label className="label">Vazifa</label><input name="role" defaultValue={m.role} className="input" /></div>
                <div className="w-20"><label className="label">Tartib</label><input name="order" type="number" defaultValue={m.order} className="input" /></div>
                <div className="w-full"><ImageCropInput name="photo" aspect={1} outWidth={600} round current={m.photoUrl} label="Rasm" preview="avatar" /></div>
                <button className="btn-dark btn-sm mb-1.5">Saqlash</button>
              </form>
              <form action={deleteTeamMember}><input type="hidden" name="id" value={m.id} /><ConfirmButton>✕</ConfirmButton></form>
            </div>
          ))}
          <form action={saveTeamMember} className="flex flex-wrap items-end gap-3">
            <div className="min-w-[160px] flex-1"><label className="label">Yangi a’zo — ism</label><input name="name" required className="input" /></div>
            <div className="min-w-[160px] flex-1"><label className="label">Vazifa</label><input name="role" className="input" /></div>
            <div className="w-20"><label className="label">Tartib</label><input name="order" type="number" defaultValue={team.length} className="input" /></div>
            <div className="w-full"><ImageCropInput name="photo" aspect={1} outWidth={600} round label="Rasm" preview="avatar" /></div>
            <button className="btn-primary btn-sm mb-1.5">Qo‘shish</button>
          </form>
        </div>

        <form action={saveSettings} className="card space-y-4 p-6">
          <h2 className="font-extrabold">Aloqa ma’lumotlari</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {SETTING_KEYS.map(({ key, label }) => <Field key={key} label={label}><input name={key} defaultValue={s[key] ?? ""} className="input" /></Field>)}
          </div>
          <button className="btn-dark btn-sm">Saqlash</button>
        </form>
      </div>
    </div>
  );
}
