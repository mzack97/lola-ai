import Image from "next/image";

export function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="container-x grid min-h-[70vh] items-center gap-12 py-14 md:grid-cols-2">
      <div className="hidden md:block">
        <div className="relative mx-auto aspect-square max-w-sm">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(251,235,221,1),transparent_65%)]" />
          <div className="absolute inset-[12%] rounded-full border border-dashed border-ink/15 animate-[spin_50s_linear_infinite]" />
          <Image src="/mark.png" alt="" width={256} height={256} className="absolute inset-[32%] h-[36%] w-[36%] animate-[spin_30s_linear_infinite]" />
        </div>
      </div>
      <div className="card mx-auto w-full max-w-md p-7 sm:p-9">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mb-6 mt-1.5 text-sm text-muted">{sub}</p>
        {children}
      </div>
    </div>
  );
}
