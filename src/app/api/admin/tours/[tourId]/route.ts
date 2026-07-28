import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tourSchema } from "@/lib/validation/tour-schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params;
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) {
    return NextResponse.json({ error: "找不到此團體" }, { status: 404 });
  }
  return NextResponse.json({ tour });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "資料格式錯誤" }, { status: 400 });
  }

  const existing = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!existing) {
    return NextResponse.json({ error: "找不到此團體" }, { status: 404 });
  }

  const tour = await prisma.tour.update({ where: { id: tourId }, data: parsed.data });
  return NextResponse.json({ tour });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  const { tourId } = await params;
  const orderCount = await prisma.order.count({ where: { tourId } });

  if (orderCount > 0) {
    // 已有訂單的團體不可真刪除，改為下架（isActive = false）以保留歷史訂單資料完整性
    const tour = await prisma.tour.update({ where: { id: tourId }, data: { isActive: false } });
    return NextResponse.json({ tour, softDeleted: true });
  }

  await prisma.tour.delete({ where: { id: tourId } });
  return NextResponse.json({ ok: true });
}
