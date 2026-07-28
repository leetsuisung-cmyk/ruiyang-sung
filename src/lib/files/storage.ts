import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// 上傳檔案實際存放於 repo 根目錄的 uploads/（不在 public/ 下），一律透過 /api/uploads/[fileId] 存取。
const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

export interface SaveFileResult {
  storedPath: string; // 相對於 UPLOADS_ROOT 的路徑
  sizeBytes: number;
}

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string
): Promise<SaveFileResult> {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  const fileName = `${randomUUID()}${ext}`;
  const relativeDir = path.join(yyyy, mm);
  const absoluteDir = path.join(UPLOADS_ROOT, relativeDir);

  await mkdir(absoluteDir, { recursive: true });

  const relativePath = path.join(relativeDir, fileName);
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);
  await writeFile(absolutePath, buffer);

  return { storedPath: relativePath.replace(/\\/g, "/"), sizeBytes: buffer.length };
}

export async function readUploadedFile(storedPath: string): Promise<Buffer> {
  const safeRelative = path.normalize(storedPath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(UPLOADS_ROOT, safeRelative);
  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    throw new Error("非法的檔案路徑");
  }
  return readFile(absolutePath);
}
