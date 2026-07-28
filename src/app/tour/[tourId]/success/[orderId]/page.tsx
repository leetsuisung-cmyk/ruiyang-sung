import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAuthorizedForOrder } from "@/lib/auth/order-authorization";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/datetime";
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/labels";
import { Button } from "@/components/ui/Button";

export default async function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ tourId: string; orderId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { orderId } = await params;
  const { t } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { tour: true },
  });
  if (!order) {
    notFound();
  }

  const authorized = await isAuthorizedForOrder(orderId, t ?? null);
  if (!authorized) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-bold text-gray-900">無法查看此訂單</h1>
        <p className="text-sm text-gray-500">請確認連結是否正確，或洽承辦人協助查詢。</p>
      </div>
    );
  }

  const pdfUrl = `/api/orders/${order.id}/receipt-pdf${t ? `?t=${t}` : ""}`;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 px-4 py-8">
      <div className="rounded-xl bg-teal-700 p-5 text-center text-white">
        <div className="text-2xl">✓</div>
        <h1 className="mt-1 text-lg font-bold">報名已送出</h1>
        <p className="mt-1 text-sm text-teal-50">訂單編號 {order.orderNo}</p>
      </div>

      <div className="flex flex-col gap-2 rounded-xl bg-white p-4 shadow-sm text-sm">
        <Row label="團名" value={order.tour.name} />
        <Row label="出發日期" value={formatDate(order.tour.departureDate)} />
        <Row label="報名人數" value={`${order.memberCount} 人`} />
        <Row label="開立日期" value={formatDateTime(order.createdAt)} />
        <Row label="付款方式" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
        <Row label="付款狀態" value={PAYMENT_STATUS_LABELS[order.paymentStatus]} />
        <hr className="my-1 border-gray-100" />
        <Row label="應收合計" value={formatCurrency(order.totalDue)} />
        <Row label="已收訂金" value={formatCurrency(order.depositRequired)} />
        <Row label="尚欠尾款" value={formatCurrency(order.balanceDue)} emphasis />
      </div>

      {order.paymentMethod === "BANK_TRANSFER" && order.paymentStatus === "UNPAID" && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
          我們已收到您的匯款資訊，將於核對款項後更新付款狀態並寄送正式收據，請耐心等候。
        </p>
      )}

      <a href={pdfUrl} target="_blank" rel="noreferrer">
        <Button className="w-full" variant="secondary">
          下載收據 PDF
        </Button>
      </a>

      <Link href="/">
        <Button className="w-full" variant="ghost">
          回首頁
        </Button>
      </Link>
    </div>
  );
}

function Row({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={emphasis ? "font-bold text-teal-800" : "text-gray-900"}>{value}</span>
    </div>
  );
}
