export function Avatar({ src, name, size = 36, className = "" }: { src?: string | null; name: string; size?: number; className?: string }) {
  const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} width={size} height={size} style={{ width: size, height: size }} className={`shrink-0 rounded-full object-cover ring-2 ring-white/80 ${className}`} />
  ) : (
    <span style={{ width: size, height: size, fontSize: size * 0.38 }} className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange to-peach font-bold text-white ring-2 ring-white/80 ${className}`}>{initials}</span>
  );
}
