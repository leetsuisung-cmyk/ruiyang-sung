import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { InvoicePdfDocument } from "@/lib/pdf/invoice-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { tour: true } });
  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }

  registerPdfFonts();

  const buffer = await renderToBuffer(
    <InvoicePdfDocument
      data={{
        orderNo: order.orderNo,
        tourName: order.tour.name,
        departureDate: order.tour.departureDate,
        memberCount: order.memberCount,
        pricePerPerson: order.pricePerPersonSnapshot,
        subtotal: order.subtotal,
        totalDiscount: order.totalDiscount,
        totalDue: order.totalDue,
        issuedDate: new Date(),
      }}
    />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(order.orderNo)}-invoice.pdf`,
    },
  });
}
