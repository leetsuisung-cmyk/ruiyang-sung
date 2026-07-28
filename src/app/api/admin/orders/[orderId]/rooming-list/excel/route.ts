import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildRoomingListExcel } from "@/lib/excel/rooming-list-excel";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { tour: true, members: { orderBy: { sortOrder: "asc" } } },
  });
  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }

  const buffer = await buildRoomingListExcel(
    order.tour.name,
    order.members.map((m) => ({
      roomNo: m.roomNo ?? "",
      chineseName: m.chineseName,
      passportEnglishName: m.passportEnglishName,
      passportNumber: m.passportNumber,
      specialDiet: m.specialDiet ?? "",
    }))
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(order.orderNo)}-rooming-list.xlsx`,
    },
  });
}
