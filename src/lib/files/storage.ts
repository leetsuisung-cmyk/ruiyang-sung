import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { del, put } from "@vercel/blob";

// 上傳檔案（護照、匯款收據）一律透過 /api/uploads/[fileId] 存取，該路由會檢查 admin session
// 或訂單專屬 token，不曾把檔案的原始網址（不論本機路徑或 Blob URL）直接回傳給前端。
//
// 本機開發：存在 repo 根目錄的 uploads/（不在 public/ 下）。
// 部署到 Vercel：Vercel 的檔案系統是唯讀且不會在請求之間保留資料，因此正式環境改用
// Vercel Blob 儲存。只要專案有連接 Blob store，Vercel 會自動注入 BLOB_READ_WRITE_TOKEN，
// 本模組會偵測到並自動切換，不需要額外設定。
//
// 注意：Vercel Blob 的 "public" 存取層級代表網址本身不易被猜到，但並非由我們的 session/token
// 機制保護——因此絕對不能把 storedPath（Blob URL）直接暴露給客戶端，一律由 /api/uploads/[fileId]
// 這一層代為 fetch 後再回傳，才能維持原本「需要 admin session 或訂單 token 才能下載」的保護。

const UPLOADS_ROOT = path.join(process.cwd(), "uploads");
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

export interface SaveFileResult {
  storedPath: string; // 本機模式：相對於 UPLOADS_ROOT 的路徑；Blob 模式：完整 Blob URL
  sizeBytes: number;
}

function buildRelativePath(originalName: string): { relativeDir: string; fileName: string } {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const ext = path.extname(originalName).toLowerCase().replace(/[^a-z0-9.]/g, "");
  return { relativeDir: path.join(yyyy, mm), fileName: `${randomUUID()}${ext}` };
}

export async function saveUploadedFile(
  buffer: Buffer,
  originalName: string
): Promise<SaveFileResult> {
  const { relativeDir, fileName } = buildRelativePath(originalName);
  const relativePath = `${relativeDir.replace(/\\/g, "/")}/${fileName}`;

  if (USE_BLOB) {
    const blob = await put(relativePath, buffer, {
      access: "public",
      addRandomSuffix: false,
    });
    return { storedPath: blob.url, sizeBytes: buffer.length };
  }

  const absoluteDir = path.join(UPLOADS_ROOT, relativeDir);
  await mkdir(absoluteDir, { recursive: true });
  const absolutePath = path.join(UPLOADS_ROOT, relativePath);
  await writeFile(absolutePath, buffer);

  return { storedPath: relativePath, sizeBytes: buffer.length };
}

export async function readUploadedFile(storedPath: string): Promise<Buffer> {
  if (/^https?:\/\//.test(storedPath)) {
    const res = await fetch(storedPath);
    if (!res.ok) {
      throw new Error(`無法從雲端儲存讀取檔案: ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  const safeRelative = path.normalize(storedPath).replace(/^(\.\.[/\\])+/, "");
  const absolutePath = path.join(UPLOADS_ROOT, safeRelative);
  if (!absolutePath.startsWith(UPLOADS_ROOT)) {
    throw new Error("非法的檔案路徑");
  }
  return readFile(absolutePath);
}

export async function deleteUploadedFile(storedPath: string): Promise<void> {
  if (/^https?:\/\//.test(storedPath)) {
    await del(storedPath);
    return;
  }
  // 本機模式目前不清理孤兒檔案，留待後續排程處理（見 README 待辦）
}
