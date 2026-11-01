"use client";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";

const FLOATERS = [
  { x: "-6%", y: "8%", d: 40, el: <><span className="h-2 w-2 rounded-full bg-ok" /> Ustoz arizangizni tasdiqladi</> },
  { x: "58%", y: "-2%", d: 70, el: <><span className="text-base">📅</span> Bugun 18:00 · Google Meet</> },
  { x: "66%", y: "74%", d: 55, el: <><span className="text-base">🎨</span> Figma · 3-hafta</> },
  { x: "-10%", y: "70%", d: 85, el: <><span className="text-base">💬</span> “Ustoz, savolim bor!”</> },
];

export function HeroVisual() {
  const mx = useMotionValue(0), my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 }), sy = useSpring(my, { stiffness: 60, damping: 18 });
  const { scrollY } = useScroll();
  const rot = useTransform(scrollY, [0, 800], [0, 120]);
  const scale = useTransform(scrollY, [0, 700], [1, 0.82]);
  const ox = useTransform(sx, (v) => v * -20), oy = useTransform(sy, (v) => v * -20);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]"
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5); }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}>
      <motion.div style={{ scale }} className="absolute inset-0">
        {/* rings */}
        <div className="absolute inset-[2%] rounded-full border border-ink/10" />
        <motion.div style={{ rotate: rot }} className="absolute inset-[9%] rounded-full border border-dashed border-orange/40" />
        <div className="absolute inset-[18%] rounded-full bg-gradient-to-br from-white/70 to-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,.9),0_40px_80px_-30px_rgba(255,83,30,.5)] backdrop-blur-xl" />
        <div className="absolute inset-[27%] rounded-full bg-[conic-gradient(from_0deg,#ff531e,#ffb38a,#fbebdd,#ff531e)] opacity-90 blur-2xl animate-spin-slow" />
        <motion.div style={{ x: ox, y: oy }} className="glass absolute inset-[30%] flex items-center justify-center rounded-full">
          <Image src="/mark.png" alt="" width={256} height={256} priority className="h-[62%] w-[62%] animate-spin-slow [animation-duration:20s]" />
        </motion.div>
      </motion.div>
      {FLOATERS.map((f, i) => <Floater key={i} f={f} i={i} sx={sx} sy={sy} />)}
    </div>
  );
}

function Floater({ f, i, sx, sy }: { f: (typeof FLOATERS)[number]; i: number; sx: MotionValue<number>; sy: MotionValue<number> }) {
  const x = useTransform(sx, (v) => v * f.d), y = useTransform(sy, (v) => v * f.d);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 160, damping: 16 }}
      style={{ left: f.x, top: f.y, x, y }} className="absolute hidden sm:block">
      <div className="glass animate-floaty flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-3 text-[13px] font-bold" style={{ animationDelay: `${-i * 1.4}s` }}>{f.el}</div>
    </motion.div>
  );
}
