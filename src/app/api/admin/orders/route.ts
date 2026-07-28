import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma, PaymentMethod, PaymentStatus } from "@prisma/client";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tourId = url.searchParams.get("tourId");
  const paymentStatus = url.searchParams.get("paymentStatus");
  const paymentMethod = url.searchParams.get("paymentMethod");

  const where: Prisma.OrderWhereInput = {};
  if (tourId) where.tourId = tourId;
  if (paymentStatus) where.paymentStatus = paymentStatus as PaymentStatus;
  if (paymentMethod) where.paymentMethod = paymentMethod as PaymentMethod;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { tour: true },
  });

  return NextResponse.json({ orders });
}
