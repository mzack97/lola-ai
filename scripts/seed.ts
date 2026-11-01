// First-time setup: creates the first admin + default categories and team.
// Safe to run many times (only adds what's missing). Run: npm run db:seed
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as s from "../src/db/schema";

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: s });

  const admins = await db.select().from(s.users).where(eq(s.users.role, "ADMIN")).limit(1);
  if (!admins.length) {
    const phoneRaw = (process.env.ADMIN_PHONE || "").replace(/\D/g, "");
    const phone = "+" + (phoneRaw.length === 9 ? "998" + phoneRaw : phoneRaw);
    const pass = process.env.ADMIN_PASSWORD || "";
    if (!/^\+998\d{9}$/.test(phone) || pass.length < 8) throw new Error("Set ADMIN_PHONE (+998XXXXXXXXX) and ADMIN_PASSWORD (8+ chars) in .env first");
    await db.insert(s.users).values({ firstName: process.env.ADMIN_FIRST_NAME || "Admin", lastName: process.env.ADMIN_LAST_NAME || "LOLA AI", phone, passwordHash: await bcrypt.hash(pass, 10), role: "ADMIN" })
      .onConflictDoUpdate({ target: s.users.phone, set: { role: "ADMIN" } });
    console.log("✓ admin created:", phone);
  } else console.log("• admin already exists");

  if (!(await db.select().from(s.categories).limit(1)).length) {
    const cats = ["IT va dasturlash", "Dizayn", "Biznes va marketing", "Kasb-hunar", "Xorijiy tillar"];
    const slug = (x: string) => x.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await db.insert(s.categories).values(cats.map((name, order) => ({ name, order, slug: slug(name) })));
    console.log("✓ categories added");
  }

  if (!(await db.select().from(s.teamMembers).limit(1)).length) {
    await db.insert(s.teamMembers).values([
      { name: "Sheraliyeva Maftuna", role: "Loyiha ambassadori", order: 0 },
      { name: "Arslanova Nodira", role: "IT va ta’lim yo‘nalishi", order: 1 },
      { name: "Mohinur", role: "Xorijiy tillar va yangi kurslar", order: 2 },
    ]);
    console.log("✓ team added");
  }
  await pool.end();
})().catch((e) => { console.error(e.message || e); process.exit(1); });
