import { createHmac } from "crypto";
import type {
  CallbackVerificationResult,
  CreateCheckoutParams,
  CreateCheckoutResult,
  PaymentProvider,
} from "./types";

/**
 * 采威國際 HiTrust TrustPay（EasyPay2）串接。
 *
 * !! 待辦（重要）!!
 * 目前尚未取得 HiTrust 官方 API 文件，以下 checktoken 產生演算法與 callback 欄位/驗簽方式
 * 都只是暫時的 placeholder，僅供本機開發與測試流程串通用，**正式上線前必須替換**：
 *   1. 跟 HiTrust 業務窗口索取正式 API 串接文件（checktoken 演算法、callback 參數規格、驗簽方式）
 *   2. 依文件重寫 `buildCheckToken()` 與 `verifyCallback()` 兩個函式
 *   3. 將 TRUSTPAY_SECRET_PLACEHOLDER 換成 HiTrust 提供的正式共用密鑰（改個新的環境變數名稱亦可）
 */

const TRUSTPAY_BASE_URL = "https://trustpay.hitrust.com.tw/TRUSTPAY/EasyPay2";

function buildCheckToken(orderNo: string, amount: number, storeId: string): string {
  const secret = process.env.TRUSTPAY_SECRET_PLACEHOLDER ?? "";
  // TODO: 替換成 HiTrust 官方演算法。目前僅用 HMAC-SHA256 產生一組 placeholder token。
  return createHmac("sha256", secret)
    .update(`${storeId}|${orderNo}|${amount}`)
    .digest("hex");
}

export const trustPayProvider: PaymentProvider = {
  async createCheckoutUrl(params: CreateCheckoutParams): Promise<CreateCheckoutResult> {
    const storeId = process.env.TRUSTPAY_STORE_ID ?? "";
    if (!storeId) {
      throw new Error("環境變數 TRUSTPAY_STORE_ID 未設定");
    }

    const checkToken = buildCheckToken(params.orderNo, params.amount, storeId);

    const url = new URL(TRUSTPAY_BASE_URL);
    url.searchParams.set("storeid", storeId);
    url.searchParams.set("checktoken", checkToken);
    // TODO: 依 HiTrust 正式文件補上訂單金額、回調網址等必要參數（欄位名稱待確認）

    return { checkoutUrl: url.toString(), checkToken };
  },

  async verifyCallback(payload: Record<string, unknown>): Promise<CallbackVerificationResult> {
    // TODO: 依 HiTrust 正式 callback 規格解析欄位與驗證簽章，以下欄位名稱為暫定猜測
    const orderId = String(payload.orderId ?? payload.orderid ?? "");
    const status = String(payload.status ?? "");
    const providerRef = String(payload.transactionId ?? payload.txid ?? "");

    return {
      success: status.toUpperCase() === "SUCCESS" || status === "1",
      orderId,
      providerRef,
      rawPayload: JSON.stringify(payload),
    };
  },
};
