import { getUser, homeFor } from "@/lib/auth";
import { HeaderClient } from "./HeaderClient";

export async function SiteHeader() {
  const u = await getUser();
  return (
    <HeaderClient
      user={u ? { firstName: u.firstName, lastName: u.lastName, avatarUrl: u.avatarUrl, role: u.role } : null}
      home={u ? homeFor(u) : "/kirish"}
    />
  );
}
