import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth/constants";

// Proxy 邏輯與 verifyAdminSessionToken (src/lib/auth/session.ts) 相同，
// 這裡獨立實作是為了不 import 到 session.ts 內用到 next/headers 的 cookies()。
async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

const PUBLIC_ADMIN_PATHS = ["/admin/login"];
const PUBLIC_ADMIN_API_PATHS = ["/api/admin/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  const isApi = pathname.startsWith("/api/admin");
  const isPublicPath = isApi
    ? PUBLIC_ADMIN_API_PATHS.some((p) => pathname.startsWith(p))
    : PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  if (isPublicPath) {
    return NextResponse.next();
  }

  const valid = await isValidSession(token);
  if (!valid) {
    if (isApi) {
      return NextResponse.json({ error: "未登入或登入已過期" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
