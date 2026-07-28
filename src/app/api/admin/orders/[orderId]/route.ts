import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceiptEmailIfNeeded } from "@/lib/order-receipt-email";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { tour: true, members: { orderBy: { sortOrder: "asc" } }, paymentTransactions: true },
  });
  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }
  return NextResponse.json({ order });
}

const patchSchema = z.object({
  paymentStatus: z.enum(["UNPAID", "DEPOSIT_PAID", "FULLY_PAID"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "狀態參數錯誤" }, { status: 400 });
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: parsed.data.paymentStatus },
  });

  if (
    existing.paymentStatus === "UNPAID" &&
    (parsed.data.paymentStatus === "DEPOSIT_PAID" || parsed.data.paymentStatus === "FULLY_PAID")
  ) {
    await sendPaymentReceiptEmailIfNeeded(order.id);
  }

  return NextResponse.json({ order });
}
