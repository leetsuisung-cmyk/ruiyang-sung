import { getAdminSession } from "./session";
import { verifyOrderAccessToken } from "./order-access";

/** admin 已登入，或 URL 帶有效的訂單存取 token，兩者其一即可存取該訂單相關資料 */
export async function isAuthorizedForOrder(orderId: string, token: string | null): Promise<boolean> {
  const adminSession = await getAdminSession();
  if (adminSession) return true;
  if (!token) return false;
  return verifyOrderAccessToken(token, orderId);
}
