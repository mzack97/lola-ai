"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform, useReducedMotion, type MotionValue } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------- smooth scrolling for the whole site ---------------- */
export function SmoothScroll() {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1 });
    let id = 0;
    const raf = (t: number) => { lenis.raf(t); id = requestAnimationFrame(raf); };
    id = requestAnimationFrame(raf);
    return () => { cancelAnimationFrame(id); lenis.destroy(); };
  }, [reduce]);
  return null;
}

/* ---------------- fade/blur up when scrolled into view ---------------- */
export function Reveal({ children, delay = 0, y = 34, className, as = "div" }: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" }) {
  const C = motion[as];
  return (
    <C className={className} initial={{ opacity: 0, y, filter: "blur(10px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </C>
  );
}

/* ---------------- staggered children ---------------- */
export function Stagger({ children, className, gap = 0.07 }: { children: React.ReactNode; className?: string; gap?: number }) {
  return (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}>
      {children}
    </motion.div>
  );
}
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 40, scale: 0.97, filter: "blur(8px)" }, show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } } }}>
      {children}
    </motion.div>
  );
}

/* ---------------- headline: words rise from a mask ---------------- */
export function SplitHeadline({ parts, className, delay = 0 }: { parts: { t: string; accent?: boolean }[]; className?: string; delay?: number }) {
  let i = 0;
  return (
    <h1 className={className} aria-label={parts.map((p) => p.t).join(" ")}>
      {parts.map((p, pi) =>
        p.t.split(" ").filter(Boolean).map((w, wi) => {
          const k = i++;
          return (
            <span key={`${pi}-${wi}`} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
              <motion.span className={`inline-block ${p.accent ? "serif-accent text-orange pr-[0.08em]" : ""}`}
                initial={{ y: "110%", rotate: 4 }} animate={{ y: "0%", rotate: 0 }} transition={{ duration: 1, delay: delay + k * 0.07, ease: EASE }}>
                {w}
              </motion.span>
              {" "}
            </span>
          );
        })
      )}
    </h1>
  );
}

/* ---------------- 3D tilt + cursor spotlight ---------------- */
export function TiltCard({ children, className, max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5), my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [max, -max]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-max, max]), { stiffness: 200, damping: 20 });
  const sx = useTransform(mx, (v) => `${v * 100}%`), sy = useTransform(my, (v) => `${v * 100}%`);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${sx} ${sy}, rgba(255,255,255,.55), transparent 45%)`;
  return (
    <motion.div ref={ref} className={`group relative [transform-style:preserve-3d] ${className ?? ""}`} style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000 }}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); mx.set((e.clientX - r.left) / r.width); my.set((e.clientY - r.top) / r.height); }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}>
      {children}
      <motion.div className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100" style={{ background: spot }} />
    </motion.div>
  );
}

/* ---------------- infinite ticker ---------------- */
export function Marquee({ items, className, reverse }: { items: React.ReactNode[]; className?: string; reverse?: boolean }) {
  return (
    <div className={`relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] ${className ?? ""}`}>
      <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10" style={{ animationDirection: reverse ? "reverse" : "normal" }}>
        {[...items, ...items].map((it, i) => <div key={i} className="shrink-0">{it}</div>)}
      </div>
    </div>
  );
}

/* ---------------- text that lights up word by word as you scroll ---------------- */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = text.split(/\s+/);
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => <Word key={i} p={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>)}
    </p>
  );
}
function Word({ children, p, range }: { children: string; p: MotionValue<number>; range: [number, number] }) {
  const o = useTransform(p, range, [0.14, 1]);
  return <motion.span style={{ opacity: o }} className="inline-block pr-[0.28em]">{children}</motion.span>;
}

/* ---------------- parallax wrapper ---------------- */
export function Parallax({ children, className, speed = 80 }: { children: React.ReactNode; className?: string; speed?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  return <motion.div ref={ref} style={{ y }} className={className}>{children}</motion.div>;
}

/* ---------------- reading progress bar ---------------- */
export function ProgressBar() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return <motion.div style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[70] h-1 origin-left bg-gradient-to-r from-orange to-peach" />;
}

/* ---------------- living gradient background (different palette per page) ---------------- */
const PALETTES = {
  warm: ["#ff7a45", "#ffb38a", "#fbebdd", "#ffd6bf"],
  sunset: ["#ff531e", "#ffa36c", "#f7c9b8", "#e9d9ff"],
  cool: ["#ffb38a", "#dcd6ff", "#cfe7ff", "#fbebdd"],
  night: ["#ff531e", "#7a2a0e", "#2a1208", "#ff8a5c"],
} as const;
export function Aurora({ variant = "warm", className }: { variant?: keyof typeof PALETTES; className?: string }) {
  const c = PALETTES[variant];
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1200], [0, 220]);
  const y2 = useTransform(scrollY, [0, 1200], [0, -160]);
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y: y1, background: `radial-gradient(circle, ${c[0]} 0%, transparent 62%)` }} className="animate-blob absolute -left-[10%] -top-[18%] h-[62vmax] w-[62vmax] rounded-full opacity-45 blur-3xl" />
      <motion.div style={{ y: y2, background: `radial-gradient(circle, ${c[1]} 0%, transparent 62%)`, animationDelay: "-6s" }} className="animate-blob absolute -right-[12%] top-[8%] h-[58vmax] w-[58vmax] rounded-full opacity-55 blur-3xl" />
      <div style={{ background: `radial-gradient(circle, ${c[2]} 0%, transparent 62%)`, animationDelay: "-12s" }} className="animate-blob absolute bottom-[-25%] left-[20%] h-[55vmax] w-[55vmax] rounded-full opacity-70 blur-3xl" />
      <div style={{ background: `radial-gradient(circle, ${c[3]} 0%, transparent 60%)`, animationDelay: "-3s" }} className="animate-blob absolute right-[25%] top-[45%] h-[30vmax] w-[30vmax] rounded-full opacity-50 blur-3xl" />
    </div>
  );
}
