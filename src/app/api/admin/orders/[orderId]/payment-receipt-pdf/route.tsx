import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { registerPdfFonts } from "@/lib/pdf/fonts";
import { PaymentReceiptPdfDocument } from "@/lib/pdf/payment-receipt-pdf";
import { buildPaymentReceiptData } from "@/lib/pdf/payment-receipt-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { tour: true, paymentTransactions: { orderBy: { createdAt: "desc" } } },
  });
  if (!order) {
    return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
  }
  if (order.paymentStatus === "UNPAID") {
    return NextResponse.json({ error: "此訂單尚未完成付款, 無法開立收據" }, { status: 400 });
  }

  registerPdfFonts();

  const buffer = await renderToBuffer(
    <PaymentReceiptPdfDocument data={buildPaymentReceiptData(order)} />
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(order.orderNo)}-receipt.pdf`,
    },
  });
}
