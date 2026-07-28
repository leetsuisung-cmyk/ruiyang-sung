# 睿煬旅行社 線上報名與收訂金系統

前台給客戶線上報名＋刷卡／匯款繳訂金，後台給承辦人管理團體、訂單、匯出請款單與分房表。

技術棧：Next.js（App Router）+ TypeScript + Tailwind CSS + Prisma（SQLite，開發環境）。

## 一、安裝與啟動

需求：Node.js 20 以上（開發時使用 v24）。

```bash
npm install
cp .env.example .env
```

打開 `.env`，至少確認 `SESSION_SECRET` 已改成一組隨機字串（正式環境務必更換，開發可先用預設值）。

初始化資料庫並建立管理員帳號＋一筆範例團：

```bash
npx prisma migrate dev
npx prisma db seed
```

啟動開發伺服器：

```bash
npm run dev
```

開啟 http://localhost:3000 即可看到前台首頁（列出開放報名的團）。

## 二、登入後台

網址：http://localhost:3000/admin/login

帳號密碼預設在 `.env` 的 `ADMIN_USERNAME` / `ADMIN_PASSWORD`（seed 時會自動用這組帳密建立管理員，密碼會做 bcrypt hash 後存進資料庫）。若要更改密碼，修改 `.env` 後重新執行 `npx prisma db seed`（僅在該帳號不存在時才會建立，若要重設現有帳號密碼，需先在 `npx prisma studio` 手動刪除該筆 Admin 資料再重新 seed，或直接在 Prisma Studio 裡貼上新的 bcrypt hash）。

後台可以：
- 建立／編輯團體（出發地、日期、天數、團費、優惠、訂金設定）
- 查看所有報名訂單、團員明細、下載護照檔案
- 手動核對匯款後更新付款狀態（未付／訂金已付／已付清），狀態轉為已付款時會自動寄送正式收據信
- 匯出請款單 PDF、分房表 PDF／Excel

## 三、環境變數說明

| 變數 | 必填 | 說明 |
|---|---|---|
| `DATABASE_URL` | 是 | Prisma 資料庫連線字串，開發用 `file:./dev.db`（SQLite） |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | 是 | 後台管理員帳密，`prisma db seed` 時用來建立帳號 |
| `SESSION_SECRET` | 是 | 簽署後台登入 session 與客戶收據存取權杖用的密鑰，正式環境務必換成隨機長字串 |
| `APP_BASE_URL` | 是 | 網站對外網址，用於 Email 內連結、金流導轉網址組裝 |
| `TRUSTPAY_STORE_ID` | 是 | 采威國際 HiTrust TrustPay 的店家代號 |
| `TRUSTPAY_SECRET_PLACEHOLDER` | 開發用 | 目前 checktoken 演算法的暫時共用密鑰，**待 HiTrust 提供正式文件後需替換整個演算法**（見下方說明） |
| `PAYMENT_TEST_MODE` | 否 | `true` 時完全不呼叫 TrustPay，直接模擬付款成功，方便本機測試整條刷卡流程 |
| `EMAIL_DEV_MODE` | 否 | 未設定 SMTP 時的開發模式：`console`（印到終端機）或 `ethereal`（產生線上預覽連結） |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | 正式環境需要 | 有設定 `SMTP_HOST` 就會改用真實 SMTP 寄信 |
| `NOTIFY_EMAIL` | 否 | 每筆新報名／付款確認信會額外副本寄一份到這裡（公司內部信箱） |

## 四、金流串接說明（重要，待補）

目前串接的是**采威國際 HiTrust TrustPay**（`https://trustpay.hitrust.com.tw/TRUSTPAY/EasyPay2`），但截至開發當下尚未取得 HiTrust 官方 API 文件，因此：

- `src/lib/payment/trustpay.ts` 內的 `checktoken` 產生演算法是暫時的 placeholder（HMAC-SHA256 湊出來的假邏輯），**不是真正可以刷卡成功的串接**
- callback 的欄位名稱與驗簽方式也是暫定猜測

**待 HiTrust 提供正式文件與密鑰後，只需要修改 `src/lib/payment/trustpay.ts` 這一個檔案**：
1. 依文件重寫 `buildCheckToken()` 產生正式 checktoken
2. 依文件重寫 `verifyCallback()` 解析真正的 callback 參數與驗簽

在正式串接完成前，把 `.env` 的 `PAYMENT_TEST_MODE` 設為 `true`，就能跑完整個「選刷卡 → 導轉 → 模擬付款成功 → 訂金已付 → 收據頁與 email」的流程，不需要真的金鑰。正式上線前記得把 `PAYMENT_TEST_MODE` 改回 `false` 或直接從 `.env` 移除。

銀行匯款不經過這條金流路徑：客戶填「匯款後五碼」＋選填上傳收據截圖後，訂單狀態維持「未付」，等後台人工核對匯款後手動改狀態（會自動觸發寄送正式收據信）。

## 五、檔案上傳與敏感資料

- 護照掃描檔／匯款收據截圖存在專案根目錄的 `uploads/` 資料夾（**不在** `public/` 底下，不會被當成靜態檔案公開存取），已加進 `.gitignore`
- 下載一律經過 `/api/uploads/[fileId]`，會檢查「目前是否為登入的管理員」或「網址是否帶有效的訂單存取權杖（`?token=`／`?t=`）」，兩者皆無則回 403
- `.env` 內所有金鑰、密碼一律不進 git（`.gitignore` 已排除 `.env*`，但保留 `.env.example`）

## 六、資料庫

開發環境使用 SQLite（`prisma/dev.db`，已加入 `.gitignore`）。之後要換 PostgreSQL：

1. 修改 `prisma/schema.prisma` 的 `datasource.provider` 為 `"postgresql"`
2. `.env` 的 `DATABASE_URL` 改成 Postgres 連線字串
3. 重新執行 `npx prisma migrate dev`

Schema 設計時已避免使用 SQLite 專屬語法，理論上直接切換即可。

## 七、部署到正式環境（簡要）

**方案 A：Vercel + 託管 Postgres + 物件儲存**
Vercel 沒有持久檔案系統，`uploads/` 的檔案上傳邏輯（`src/lib/files/storage.ts`）需要改成寫入 S3 / Cloudflare R2 等物件儲存服務；資料庫可用 Neon / Supabase / Railway 等託管 Postgres。

**方案 B：一般 VPS + Docker**
用 Docker 跑 Next.js + Postgres，`uploads/` 掛一個 volume 保留上傳檔案，不需要額外的物件儲存服務，架構較單純。

不論哪種方案，記得：
- 設定正式的 `SESSION_SECRET`（隨機長字串）
- 設定正式 SMTP 帳密
- 依 HiTrust 正式文件替換 `src/lib/payment/trustpay.ts` 並關閉 `PAYMENT_TEST_MODE`
- `APP_BASE_URL` 改成正式網域（否則 Email 內連結與金流導轉網址會錯誤）

## 八、已知待辦事項

- HiTrust TrustPay 正式串接（checktoken 演算法、callback 驗簽）— 待官方文件
- 正式 SMTP 帳密
- 正式環境資料庫與檔案儲存方案的實際選定與設定
