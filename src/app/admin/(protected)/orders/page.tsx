import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDateTime } from "@/lib/datetime";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";
import type { Prisma, PaymentMethod, PaymentStatus } from "@prisma/client";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ tourId?: string; paymentStatus?: string; paymentMethod?: string }>;
}) {
  const { tourId, paymentStatus, paymentMethod } = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (tourId) where.tourId = tourId;
  if (paymentStatus) where.paymentStatus = paymentStatus as PaymentStatus;
  if (paymentMethod) where.paymentMethod = paymentMethod as PaymentMethod;

  const [orders, tours] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: { tour: true } }),
    prisma.tour.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">報名訂單</h1>

      <form method="GET" className="flex flex-wrap gap-2 rounded-xl bg-white p-3 shadow-sm text-sm">
        <select name="tourId" defaultValue={tourId ?? ""} className="rounded-lg border border-gray-300 px-2 py-1.5">
          <option value="">全部團體</option>
          {tours.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          name="paymentStatus"
          defaultValue={paymentStatus ?? ""}
          className="rounded-lg border border-gray-300 px-2 py-1.5"
        >
          <option value="">全部付款狀態</option>
          <option value="UNPAID">未付</option>
          <option value="DEPOSIT_PAID">訂金已付</option>
          <option value="FULLY_PAID">已付清</option>
        </select>
        <select
          name="paymentMethod"
          defaultValue={paymentMethod ?? ""}
          className="rounded-lg border border-gray-300 px-2 py-1.5"
        >
          <option value="">全部付款方式</option>
          <option value="CREDIT_CARD">線上刷卡</option>
          <option value="BANK_TRANSFER">銀行匯款</option>
        </select>
        <button type="submit" className="rounded-lg bg-teal-700 px-3 py-1.5 text-white">
          篩選
        </button>
        <Link href="/admin/orders" className="rounded-lg border border-gray-300 px-3 py-1.5 text-gray-600">
          清除
        </Link>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">訂單編號</th>
              <th className="px-4 py-3">團體</th>
              <th className="px-4 py-3">聯絡人</th>
              <th className="px-4 py-3">人數</th>
              <th className="px-4 py-3">付款方式</th>
              <th className="px-4 py-3">付款狀態</th>
              <th className="px-4 py-3">應收合計</th>
              <th className="px-4 py-3">建立時間</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{order.orderNo}</td>
                <td className="px-4 py-3">{order.tour.name}</td>
                <td className="px-4 py-3">{order.contactName}</td>
                <td className="px-4 py-3">{order.memberCount}</td>
                <td className="px-4 py-3">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={order.paymentStatus} />
                </td>
                <td className="px-4 py-3">{formatCurrency(order.totalDue)}</td>
                <td className="px-4 py-3 text-gray-500">{formatDateTime(order.createdAt)}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-teal-700 hover:underline">
                    查看
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">
                  尚無符合條件的訂單
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    UNPAID: "bg-gray-100 text-gray-600",
    DEPOSIT_PAID: "bg-amber-100 text-amber-700",
    FULLY_PAID: "bg-green-100 text-green-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${styles[status] ?? ""}`}>
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}
