import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceiptEmailIfNeeded } from "@/lib/order-receipt-email";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }

  await sendPaymentReceiptEmailIfNeeded(orderId, { force: true });
  return NextResponse.json({ ok: true });
}
