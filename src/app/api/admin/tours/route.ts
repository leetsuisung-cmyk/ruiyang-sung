import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { tourSchema } from "@/lib/validation/tour-schema";

export async function GET() {
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return NextResponse.json({ tours });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = tourSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "資料格式錯誤" }, { status: 400 });
  }

  const tour = await prisma.tour.create({ data: parsed.data });
  return NextResponse.json({ tour }, { status: 201 });
}
