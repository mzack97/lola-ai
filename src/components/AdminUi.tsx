import Link from "next/link";

export function AdminHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-muted">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Flash({ sp }: { sp: { ok?: string; err?: string } }) {
  if (sp.err) return <div className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{sp.err}</div>;
  if (sp.ok) return <div className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">✓ Saqlandi</div>;
  return null;
}

export function Back({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="mb-4 inline-block text-sm font-semibold text-muted hover:text-orange">← {label}</Link>;
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <div><label className="label">{label}</label>{children}{hint && <p className="mt-1 text-xs text-muted">{hint}</p>}</div>;
}

export function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-orange" /> {label}</label>;
}

export function ConfirmButton({ children, msg = "Rostdan ham o‘chirasizmi?" }: { children: React.ReactNode; msg?: string }) {
  // tiny inline confirm without client JS: a checkbox must be ticked first
  return (
    <details className="inline-block">
      <summary className="btn-danger btn-sm list-none">{children}</summary>
      <div className="mt-2 rounded-xl border border-red-200 bg-white p-3 text-xs">
        <p className="mb-2 font-semibold text-red-700">{msg}</p>
        <button className="btn-danger btn-sm">Ha, o‘chirish</button>
      </div>
    </details>
  );
}
