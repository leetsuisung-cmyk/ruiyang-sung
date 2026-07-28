import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// 上傳檔案（護照、匯款收據）一律透過 /api/uploads/[fileId] 存取，該路由會檢查 admin session
// 或訂單專屬 token，不曾把檔案的本機路徑直接回傳給前端。
//
// 存放位置預設是專案根目錄的 uploads/（不在 public/ 下）。部署到 Zeabur 等有「持久化 Volume」
// 的平台時，把 Volume 掛載到某個路徑（例如 /data），並設定環境變數 UPLOADS_DIR=/data/uploads，
// 這樣容器重啟或重新部署後檔案才不會遺失；本機開發不用設定，預設就是專案內的 uploads/。
const UPLOADS_ROOT = process.env.UPLOADS_DIR
  ? path.resolve(process.env.UPLOADS_DIR)
  : path.join(process.cwd(), "uploads");

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
