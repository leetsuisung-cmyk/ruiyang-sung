import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider } from "@/lib/payment/provider";
import { verifyOrderAccessToken } from "@/lib/auth/order-access";
import { sendPaymentReceiptEmailIfNeeded } from "@/lib/order-receipt-email";

async function markOrderDepositPaid(orderId: string, providerRef: string, rawPayload: string, isTestMode: boolean) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;

  // 此次消費收尾款時，付款成功即視為已付清；收訂金則為訂金已付
  const isBalanceCharge = order.chargeTypeSnapshot === "BALANCE";
  const paidAmount = isBalanceCharge ? order.balanceDue : order.depositRequired;

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: "TRUSTPAY",
      amount: paidAmount,
      status: "SUCCESS",
      providerRef,
      rawCallbackPayload: rawPayload,
      isTestMode,
    },
  });

  if (order.paymentStatus === "UNPAID") {
    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: isBalanceCharge ? "FULLY_PAID" : "DEPOSIT_PAID" },
    });
  }

  await sendPaymentReceiptEmailIfNeeded(order.id);

  return order;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const isTest = url.searchParams.get("test") === "1";
  const orderId = url.searchParams.get("orderId");
  const token = url.searchParams.get("t") ?? "";

  if (!orderId) {
    return NextResponse.json({ error: "缺少 orderId" }, { status: 400 });
  }

  if (isTest) {
    const order = await markOrderDepositPaid(orderId, `TEST-${Date.now()}`, JSON.stringify({ test: true }), true);
    if (!order) {
      return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
    }
    return NextResponse.redirect(
      `${baseUrl}/tour/${order.tourId}/success/${order.id}?t=${token}`
    );
  }

  // 正式 TrustPay 導轉回來的情境（欄位名稱待官方文件確認）
  const payload = Object.fromEntries(url.searchParams.entries());
  const provider = getPaymentProvider();
  const result = await provider.verifyCallback(payload);

  if (!result.orderId) {
    return NextResponse.json({ error: "callback 缺少訂單資訊" }, { status: 400 });
  }

  if (result.success) {
    await markOrderDepositPaid(result.orderId, result.providerRef, result.rawPayload, false);
  }

  const validToken = await verifyOrderAccessToken(token, result.orderId);
  const order = await prisma.order.findUnique({ where: { id: result.orderId } });
  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }
  return NextResponse.redirect(
    `${baseUrl}/tour/${order.tourId}/success/${order.id}${validToken ? `?t=${token}` : ""}`
  );
}

export async function POST(request: Request) {
  // 保留給 HiTrust 未來可能採用的 server-to-server webhook 通知
  const payload = await request.json().catch(() => ({}));
  const provider = getPaymentProvider();
  const result = await provider.verifyCallback(payload);

  if (!result.orderId) {
    return NextResponse.json({ error: "callback 缺少訂單資訊" }, { status: 400 });
  }

  if (result.success) {
    await markOrderDepositPaid(result.orderId, result.providerRef, result.rawPayload, false);
  }

  return NextResponse.json({ ok: true });
}
