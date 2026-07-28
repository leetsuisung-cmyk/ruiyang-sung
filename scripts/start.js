// 容器啟動 wrapper（Zeabur 用）：
// 平台上可能殘留舊的 postgres:// DATABASE_URL（或由綁定的 PostgreSQL 服務自動注入），
// 本專案使用 SQLite，這裡在啟動前強制修正成 file: 開頭的路徑，避免 Prisma 直接報錯。
const { spawnSync } = require("node:child_process");

const FALLBACK_DATABASE_URL = "file:/data/prod.db";
const FALLBACK_UPLOADS_DIR = "/data/uploads";

const url = process.env.DATABASE_URL;
const isProd = process.env.NODE_ENV === "production";

if (url && !url.startsWith("file:")) {
  // 只印 protocol，不印完整連線字串（可能含密碼）
  const protocol = url.split("://")[0];
  console.warn(
    `[start] DATABASE_URL 不是 file: 開頭（偵測到 ${protocol}://...），` +
      `本專案使用 SQLite，已強制改用 ${FALLBACK_DATABASE_URL}`
  );
  process.env.DATABASE_URL = FALLBACK_DATABASE_URL;
} else if (!url && isProd) {
  console.warn(`[start] 未設定 DATABASE_URL，使用預設值 ${FALLBACK_DATABASE_URL}`);
  process.env.DATABASE_URL = FALLBACK_DATABASE_URL;
}

if (!process.env.UPLOADS_DIR && isProd) {
  console.warn(`[start] 未設定 UPLOADS_DIR，使用預設值 ${FALLBACK_UPLOADS_DIR}`);
  process.env.UPLOADS_DIR = FALLBACK_UPLOADS_DIR;
}

for (const args of [
  ["prisma", "migrate", "deploy"],
  ["prisma", "db", "seed"],
  ["next", "start"],
]) {
  const result = spawnSync("npx", args, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
