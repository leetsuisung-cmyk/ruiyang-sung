import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPaymentProvider, isPaymentTestMode } from "@/lib/payment/provider";
import { createOrderAccessToken } from "@/lib/auth/order-access";

const bodySchema = z.object({ orderId: z.string().min(1) });

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "缺少訂單編號" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }
  if (order.paymentMethod !== "CREDIT_CARD") {
    return NextResponse.json({ error: "此訂單非線上刷卡訂單" }, { status: 400 });
  }
  if (order.paymentStatus !== "UNPAID") {
    return NextResponse.json({ error: "此訂單已完成付款" }, { status: 400 });
  }

  const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
  const accessToken = await createOrderAccessToken(order.id);

  if (isPaymentTestMode()) {
    // 測試模式：不呼叫真正的 TrustPay，導向我們自己的 callback route 模擬付款成功
    const checkoutUrl = `${baseUrl}/api/payment/trustpay/callback?test=1&orderId=${order.id}&t=${accessToken}`;
    return NextResponse.json({ checkoutUrl });
  }

  const provider = getPaymentProvider();
  const { checkoutUrl, checkToken } = await provider.createCheckoutUrl({
    orderId: order.id,
    orderNo: order.orderNo,
    amount: order.depositRequired,
  });

  await prisma.paymentTransaction.create({
    data: {
      orderId: order.id,
      provider: "TRUSTPAY",
      amount: order.depositRequired,
      status: "PENDING",
      checkToken,
      isTestMode: false,
    },
  });

  return NextResponse.json({ checkoutUrl });
}
