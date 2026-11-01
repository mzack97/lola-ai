import "server-only";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR || "./uploads");

const IMAGE = ["jpg", "jpeg", "png", "webp", "gif"];
const DOCS = [...IMAGE, "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "zip", "mp3", "mp4"];

/** Saves an uploaded file and returns its public URL (/uploads/...), or null when no file was chosen. Throws a readable error. */
export async function saveUpload(file: FormDataEntryValue | null, kind: "image" | "doc" = "image"): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const allowed = kind === "image" ? IMAGE : DOCS;
  if (!allowed.includes(ext)) throw new Error(`Bu turdagi fayl qabul qilinmaydi (.${ext})`);
  const max = (kind === "image" ? 5 : 50) * 1024 * 1024;
  if (file.size > max) throw new Error(`Fayl juda katta (maksimum ${max / 1024 / 1024} MB)`);
  const month = new Date().toISOString().slice(0, 7);
  const dir = path.join(UPLOAD_DIR, month);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${month}/${name}`;
}
