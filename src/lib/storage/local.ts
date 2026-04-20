import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { StorageAdapter } from ".";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/heic": ".heic",
  "image/gif": ".gif",
};

export const localStorageAdapter: StorageAdapter = {
  async save(buffer, mimeType) {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const ext = EXT[mimeType.toLowerCase()] ?? ".bin";
    const name = `${randomUUID()}${ext}`;
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    return { url: `/uploads/${name}` };
  },
};
