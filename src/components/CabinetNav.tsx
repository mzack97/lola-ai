import Link from "next/link";
import type { User } from "@/db";
import { roleLabel } from "@/lib/utils";

export function CabinetHead({ user, title, links }: { user: User; title: string; links: { href: string; label: string; active?: boolean }[] }) {
  return (
    <div className="mb-8">
      <div className="kicker mb-2">{roleLabel[user.role]} · {user.firstName} {user.lastName}</div>
      <h1 className="h-title">{title}</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`chip px-4 py-2 text-sm ${l.active ? "bg-ink text-white" : "hover:bg-[#e9e4df]"}`}>{l.label}</Link>
        ))}
      </div>
    </div>
  );
}
