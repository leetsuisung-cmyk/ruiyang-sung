import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { ReceiptPdfDocument } from "@/lib/pdf/receipt-pdf";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";

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

  // 與客人端收據共用同一份「請款單」版面，後台匯出的內容與客人拿到的一致
  const buffer = await renderToBuffer(
    <ReceiptPdfDocument
      data={{
        orderNo: order.orderNo,
        tourName: order.tour.name,
        tourCode: order.tourCode ?? order.tour.tourCode,
        departureCountry: order.departureCountry ?? order.tour.departureCountry,
        departureDate: order.departureDate ?? order.tour.departureDate,
        days: order.days ?? order.tour.days,
        memberCount: order.memberCount,
        pricePerPerson: order.pricePerPersonSnapshot,
        subtotal: order.subtotal,
        totalDiscount: order.totalDiscount,
        totalDue: order.totalDue,
        depositRequired: order.depositRequired,
        balanceDue: order.balanceDue,
        chargeType: order.chargeTypeSnapshot,
        contactName: order.contactName,
        contactPhone: order.contactPhone,
        paymentMethodLabel: PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod,
        paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus,
        createdAt: order.createdAt,
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
