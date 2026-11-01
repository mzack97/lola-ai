// DEMO DATA for local testing only — never run on the real server.
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import * as s from "../src/db/schema";

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema: s });
  const pw = await bcrypt.hash("demo1234", 10);
  const cats = await db.select().from(s.categories);
  const cat = (n: string) => cats.find((c) => c.name.startsWith(n))!.id;
  const [t] = await db.insert(s.users).values({ firstName: "Nodira", lastName: "Arslanova", phone: "+998901000001", passwordHash: pw, role: "TEACHER" }).returning();
  const [st] = await db.insert(s.users).values({ firstName: "Madina", lastName: "Karimova", phone: "+998901000002", passwordHash: pw, region: "Namangan viloyati", district: "Pop tumani" }).returning();
  const [st2] = await db.insert(s.users).values({ firstName: "Gulnoza", lastName: "Yusupova", phone: "+998901000003", passwordHash: pw, region: "Namangan viloyati", district: "Chust tumani" }).returning();
  const day = (d: number) => new Date(Date.now() + d * 864e5);
  const cs = await db.insert(s.courses).values([
    { title: "Web dasturlash asoslari", slug: "web-dasturlash-asoslari", categoryId: cat("IT"), summary: "HTML, CSS va JavaScript bilan birinchi saytingizni yarating.", description: "Kimlar uchun: dasturlashni noldan boshlamoqchi bo‘lganlar.\n\nNimani o‘rganasiz:\n— HTML va CSS asoslari\n— JavaScript bilan interaktivlik\n— O‘z portfolio saytingizni joylash\n\nNatija: kurs oxirida internetda ishlaydigan shaxsiy saytingiz bo‘ladi.", schedule: "Du, Cho, Ju · 18:00", startDate: day(7), capacity: 25, published: true },
    { title: "Grafik dizayn: Figma", slug: "grafik-dizayn-figma", categoryId: cat("Dizayn"), summary: "Logotip, post va ilova interfeyslarini Figma’da chizishni o‘rganing.", schedule: "Se, Pa · 17:00", startDate: day(10), capacity: 20, published: true },
    { title: "SMM va raqamli marketing", slug: "smm-va-raqamli-marketing", categoryId: cat("Biznes"), summary: "Instagram va Telegram orqali biznesni rivojlantirish.", schedule: "Sha · 11:00", startDate: day(14), capacity: 30, published: true, autoApprove: true },
    { title: "Ingliz tili: IT uchun", slug: "ingliz-tili-it-uchun", categoryId: cat("Xorijiy"), summary: "Texnik matnlarni o‘qish va xalqaro jamoada ishlash uchun ingliz tili.", schedule: "Du, Cho · 19:30", startDate: day(5), capacity: 15, published: true },
  ]).returning();
  await db.insert(s.courseTeachers).values([{ courseId: cs[0].id, teacherId: t.id }, { courseId: cs[1].id, teacherId: t.id }]);
  await db.insert(s.enrollments).values([
    { courseId: cs[0].id, studentId: st.id, status: "APPROVED", decidedById: t.id, decidedAt: new Date() },
    { courseId: cs[0].id, studentId: st2.id, status: "PENDING" },
  ]);
  const secs = await db.insert(s.sections).values([
    { courseId: cs[0].id, title: "1-hafta: Kirish va HTML", order: 0 },
    { courseId: cs[0].id, title: "2-hafta: CSS asoslari", order: 1 },
    { courseId: cs[0].id, title: "3-hafta: JavaScript", order: 2, visible: false },
  ]).returning();
  await db.insert(s.lessons).values({ sectionId: secs[0].id, title: "HTML: birinchi sahifa", startsAt: day(1), meetUrl: "https://meet.google.com/abc-defg-hij", createdById: t.id });
  await db.insert(s.messages).values([
    { sectionId: secs[0].id, authorId: t.id, text: "Assalomu alaykum, qizlar! Ertaga birinchi darsimiz. Noutbuk yoki telefon tayyor bo‘lsin 🙂" },
    { sectionId: secs[0].id, authorId: t.id, text: "📅 Dars e’lon qilindi: HTML: birinchi sahifa\n🔗 https://meet.google.com/abc-defg-hij" },
    { sectionId: secs[0].id, authorId: st.id, text: "Rahmat, ustoz! Kutamiz." },
  ]);
  await db.insert(s.materials).values({ sectionId: secs[0].id, title: "HTML bo‘yicha qo‘llanma (MDN)", url: "https://developer.mozilla.org/uz/docs/Learn/HTML", uploadedById: t.id });
  await db.insert(s.news).values([
    { title: "LOLA AI platformasi rasman ishga tushirildi", slug: "lola-ai-ishga-tushirildi", excerpt: "Namangan viloyatida qizlar uchun zamonaviy kasblar platformasi ochildi.", body: "Tantanali marosimda platforma viloyat hokimi tomonidan ishga tushirildi.", published: true, publishedAt: day(-3) },
    { title: "Birinchi kurslarga qabul boshlandi", slug: "birinchi-kurslarga-qabul", excerpt: "Web dasturlash, dizayn, SMM va ingliz tili kurslariga ariza qoldiring.", published: true, publishedAt: day(-1) },
  ]);
  await db.insert(s.settings).values([{ key: "phone", value: "+998 69 000-00-00" }, { key: "telegram", value: "https://t.me/lola_ai" }, { key: "address", value: "Namangan shahri" }]).onConflictDoNothing();
  console.log("✓ demo data");
  await pool.end();
})().catch((e) => { console.error(e); process.exit(1); });
