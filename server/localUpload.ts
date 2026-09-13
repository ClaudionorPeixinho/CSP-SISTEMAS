// Local disk storage used for uploaded images when no cloud storage
// (BUILT_IN_FORGE_API_URL / BUILT_IN_FORGE_API_KEY) is configured.
import fs from "fs";
import path from "path";

export const UPLOADS_DIR = path.resolve(import.meta.dirname, "..", "data", "uploads");

export function localStorePut(fileName: string, buffer: Buffer): { key: string; url: string } {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const extension = fileName.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  fs.writeFileSync(path.join(UPLOADS_DIR, key), buffer);
  return { key, url: `/uploads/${key}` };
}
