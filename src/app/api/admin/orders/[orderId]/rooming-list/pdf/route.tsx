import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { RoomingListPdfDocument } from "@/lib/pdf/rooming-list-pdf";

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

  registerPdfFonts();

  const buffer = await renderToBuffer(
    <RoomingListPdfDocument
      data={{
        tourName: order.tour.name,
        departureDate: order.tour.departureDate,
        orderNo: order.orderNo,
        rows: order.members.map((m) => ({
          roomNo: m.roomNo ?? "",
          chineseName: m.chineseName,
          phone: m.phone,
          specialDiet: m.specialDiet ?? "",
        })),
      }}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(order.orderNo)}-rooming-list.pdf`,
    },
  });
}
