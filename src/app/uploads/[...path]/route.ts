import { readFile, stat } from "fs/promises";
import path from "path";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
  pdf: "application/pdf", mp3: "audio/mpeg", mp4: "video/mp4", txt: "text/plain; charset=utf-8",
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  const file = path.resolve(UPLOAD_DIR, ...parts);
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  try {
    await stat(file);
    const data = await readFile(file);
    const ext = (file.split(".").pop() || "").toLowerCase();
    return new Response(data, {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        ...(TYPES[ext] ? {} : { "Content-Disposition": `attachment; filename="${path.basename(file)}"` }),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
