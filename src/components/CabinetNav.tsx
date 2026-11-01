import Link from "next/link";
import type { User } from "@/db";
import { roleLabel } from "@/lib/utils";

export function CabinetHead({ user, title, links }: { user: User; title: string; links: { href: string; label: string; active?: boolean }[] }) {
  return (
    <div className="mb-8">
      <div className="kicker mb-2">{roleLabel[user.role]} · {user.firstName} {user.lastName}</div>
      <h1 className="display text-[clamp(2.6rem,6vw,4.6rem)]">{title}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`chip px-4 py-2 text-sm transition ${l.active ? "!bg-ink text-white" : "hover:!bg-white"}`}>{l.label}</Link>
        ))}
      </div>
    </div>
  );
}
