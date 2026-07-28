import { SignJWT, jwtVerify } from "jose";

const ORDER_ACCESS_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 天，讓客戶之後仍可回來下載收據

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("環境變數 SESSION_SECRET 未設定或長度過短");
  }
  return new TextEncoder().encode(secret);
}

/** 訂單專屬存取權杖：只允許客戶存取自己這筆訂單的資料/檔案/PDF，不能用來存取其他訂單 */
export async function createOrderAccessToken(orderId: string): Promise<string> {
  return new SignJWT({ orderId, type: "order-access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ORDER_ACCESS_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifyOrderAccessToken(
  token: string,
  expectedOrderId: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.type === "order-access" && payload.orderId === expectedOrderId;
  } catch {
    return false;
  }
}
