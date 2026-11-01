import Link from "next/link";
import Image from "next/image";

export function Logo({ className = "h-7" }: { className?: string }) {
  return (
    <Link href="/" aria-label="LOLA AI — bosh sahifa" className="inline-flex items-center">
      <Image src="/logo.png" alt="LOLAI" width={954} height={258} priority className={`${className} w-auto`} />
    </Link>
  );
}
