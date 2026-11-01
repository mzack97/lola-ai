"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

const STEPS = [
  { t: "Ro‘yxatdan o‘ting", d: "Telefon raqamingiz bilan bir daqiqada hisob oching.", icon: "✦" },
  { t: "Kursni tanlang", d: "IT, dizayn, biznes, tillar — o‘zingizga yoqqan yo‘nalishga ariza qoldiring.", icon: "◎" },
  { t: "Ustoz tasdiqlaydi", d: "Guruhga qabul qilingach, kurs xonangiz ochiladi.", icon: "✓" },
  { t: "Jonli darslar", d: "Darslar Google Meet orqali. Havola kurs xonasida, bir tugma bilan.", icon: "▶" },
  { t: "Amaliyot va ish", d: "Bilimingizni loyihalarda qo‘llang, frilans va ish imkoniyatlariga yo‘l oching.", icon: "↗" },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);
  const bar = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <section ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="container-x mb-10 flex items-end justify-between gap-6">
          <div>
            <div className="kicker mb-4"><span className="h-1.5 w-1.5 rounded-full bg-orange" />Qanday ishlaydi</div>
            <h2 className="h-title">Besh qadam — <span className="serif-accent text-orange">yangi kasb</span> sari</h2>
          </div>
          <div className="hidden h-1 w-48 overflow-hidden rounded-full bg-ink/10 md:block"><motion.div style={{ width: bar }} className="h-full bg-orange" /></div>
        </div>
        <motion.div style={{ x }} className="flex gap-6 pl-[max(1rem,calc((100vw-1240px)/2+2rem))]">
          {STEPS.map((s, i) => (
            <div key={i} className={`group relative flex h-[420px] w-[78vw] shrink-0 flex-col justify-between overflow-hidden rounded-[36px] p-8 sm:w-[440px] ${i % 2 ? "glass-dark text-white" : "glass"}`}>
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm font-bold text-orange">0{i + 1} / 05</span>
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${i % 2 ? "bg-white/10" : "bg-white/70"}`}>{s.icon}</span>
              </div>
              <div className="display pointer-events-none absolute -right-4 top-16 text-[220px] leading-none opacity-[.06]">{i + 1}</div>
              <div>
                <h3 className="display text-4xl">{s.t}</h3>
                <p className={`mt-4 max-w-sm text-base leading-7 ${i % 2 ? "text-white/70" : "text-muted"}`}>{s.d}</p>
              </div>
            </div>
          ))}
          <div className="w-[10vw] shrink-0" />
        </motion.div>
      </div>
    </section>
  );
}
