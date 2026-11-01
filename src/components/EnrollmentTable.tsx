import { decideEnrollment } from "@/app/actions/enrollments";
import { fmtDate, formatPhone, statusLabel } from "@/lib/utils";

export type ERow = { id: string; status: "PENDING" | "APPROVED" | "REJECTED"; createdAt: Date; first: string; last: string; phone: string; district: string | null; course?: string };

export function EnrollmentTable({ rows, back, showCourse }: { rows: ERow[]; back: string; showCourse?: boolean }) {
  if (!rows.length) return <div className="card border-dashed p-8 text-center text-sm text-muted">Ro‘yxat bo‘sh.</div>;
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-muted">
          <tr><th className="p-3">Ism</th>{showCourse && <th className="p-3">Kurs</th>}<th className="p-3">Telefon</th><th className="p-3">Tuman</th><th className="p-3">Sana</th><th className="p-3">Holat</th><th className="p-3 text-right">Amal</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="p-3 font-bold">{r.first} {r.last}</td>
              {showCourse && <td className="p-3">{r.course}</td>}
              <td className="p-3 font-mono text-xs">{formatPhone(r.phone)}</td>
              <td className="p-3 text-muted">{r.district || "—"}</td>
              <td className="p-3 text-muted">{fmtDate(r.createdAt)}</td>
              <td className="p-3"><span className={`chip ${r.status === "APPROVED" ? "bg-green-100 text-green-800" : r.status === "PENDING" ? "bg-cream" : ""}`}>{statusLabel[r.status]}</span></td>
              <td className="p-3">
                <div className="flex justify-end gap-2">
                  {r.status !== "APPROVED" && (
                    <form action={decideEnrollment}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="APPROVED" /><input type="hidden" name="back" value={back} /><button className="btn-primary btn-sm">Qabul qilish</button></form>
                  )}
                  {r.status !== "REJECTED" && (
                    <form action={decideEnrollment}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="decision" value="REJECTED" /><input type="hidden" name="back" value={back} /><button className="btn-ghost btn-sm">{r.status === "APPROVED" ? "Chiqarish" : "Rad etish"}</button></form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
