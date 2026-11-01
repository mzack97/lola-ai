import { requireUser, homeFor } from "@/lib/auth";
import { formatPhone } from "@/lib/utils";
import { CabinetHead } from "@/components/CabinetNav";
import { ProfileForms } from "@/components/ProfileForms";

export const metadata = { title: "Profil" };

export default async function Profile() {
  const u = await requireUser();
  const home = homeFor(u);
  return (
    <div className="container-x py-14">
      <CabinetHead user={u} title="Profil" links={[{ href: home, label: home === "/kabinet" ? "Kurslarim" : "Kabinet" }, { href: "/kabinet/profil", label: "Profil", active: true }]} />
      <ProfileForms u={{ firstName: u.firstName, lastName: u.lastName, region: u.region, district: u.district, phone: formatPhone(u.phone) }} />
    </div>
  );
}
