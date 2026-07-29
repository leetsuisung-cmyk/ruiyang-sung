import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/datetime";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";
import { OrderStatusControl } from "@/components/admin/OrderStatusControl";
import { RoomingListEditor } from "@/components/admin/RoomingListEditor";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      tour: true,
      members: { orderBy: { sortOrder: "asc" } },
      paymentTransactions: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-lg font-bold text-gray-900">訂單 {order.orderNo}</h1>
        <p className="text-sm text-gray-500">{order.tour.name}</p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm text-sm">
          <h2 className="mb-2 text-sm font-bold text-gray-900">訂單資訊</h2>
          <Row label="出發日期" value={formatDate(order.tour.departureDate)} />
          <Row label="報名人數" value={`${order.memberCount} 人`} />
          <Row label="聯絡人" value={order.contactName} />
          <Row label="連絡電話" value={order.contactPhone} />
          <Row label="Email" value={order.contactEmail} />
          <Row label="建立時間" value={formatDateTime(order.createdAt)} />
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm text-sm">
          <h2 className="mb-2 text-sm font-bold text-gray-900">付款資訊</h2>
          <Row label="付款方式" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
          <Row label="付款狀態" value={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
          <Row label="小計" value={formatCurrency(order.subtotal)} />
          <Row label="優惠金額" value={`- ${formatCurrency(order.totalDiscount)}`} />
          <Row label="應收合計" value={formatCurrency(order.totalDue)} emphasis />
          <Row label="應繳訂金" value={formatCurrency(order.depositRequired)} emphasis />
          <Row label="尚欠尾款" value={formatCurrency(order.balanceDue)} />
          {order.paymentMethod === "BANK_TRANSFER" && (
            <>
              <Row label="匯款後五碼" value={order.bankTransferLast5 ?? "-"} />
              {order.bankReceiptFileId && (
                <a
                  href={`/api/uploads/${order.bankReceiptFileId}`}
                  target="_blank"
                  className="mt-1 inline-block text-teal-700 hover:underline"
                >
                  查看匯款收據截圖
                </a>
              )}
            </>
          )}
          <div className="mt-3">
            <OrderStatusControl orderId={order.id} currentStatus={order.paymentStatus} />
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-gray-900">團員資料與分房表</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <a href={`/api/admin/orders/${order.id}/invoice-pdf`} className="text-teal-700 hover:underline">
              匯出請款單 PDF
            </a>
            <a href={`/api/admin/orders/${order.id}/rooming-list/pdf`} className="text-teal-700 hover:underline">
              匯出分房表 PDF
            </a>
            <a href={`/api/admin/orders/${order.id}/rooming-list/excel`} className="text-teal-700 hover:underline">
              匯出分房表 Excel
            </a>
          </div>
        </div>

        <RoomingListEditor
          orderId={order.id}
          members={order.members.map((m) => ({
            id: m.id,
            chineseName: m.chineseName,
            phone: m.phone,
            specialDiet: m.specialDiet,
            roomNo: m.roomNo,
          }))}
        />
      </section>
    </div>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className={emphasis ? "font-bold text-teal-800" : "text-gray-900"}>{value}</span>
    </div>
  );
}
