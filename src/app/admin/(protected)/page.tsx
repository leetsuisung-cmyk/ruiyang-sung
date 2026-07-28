import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/datetime";

export default async function AdminDashboardPage() {
  const [activeTourCount, unpaidCount, depositPaidCount, fullyPaidCount, totalDepositCollected] =
    await Promise.all([
      prisma.tour.count({ where: { isActive: true } }),
      prisma.order.count({ where: { paymentStatus: "UNPAID" } }),
      prisma.order.count({ where: { paymentStatus: "DEPOSIT_PAID" } }),
      prisma.order.count({ where: { paymentStatus: "FULLY_PAID" } }),
      prisma.order.aggregate({
        _sum: { depositRequired: true },
        where: { paymentStatus: { in: ["DEPOSIT_PAID", "FULLY_PAID"] } },
      }),
    ]);

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { tour: true },
  });

  const cards = [
    { label: "開放報名團數", value: activeTourCount },
    { label: "未付款訂單", value: unpaidCount },
    { label: "訂金已付", value: depositPaidCount },
    { label: "已付清", value: fullyPaidCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-lg font-bold text-gray-900">總覽</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="text-2xl font-bold text-teal-700">{card.value}</div>
            <div className="text-xs text-gray-500">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-sm text-gray-500">累計已收訂金金額</div>
        <div className="text-xl font-bold text-gray-900">
          {formatCurrency(totalDepositCollected._sum.depositRequired ?? 0)}
        </div>
      </div>

      <div className="rounded-xl bg-white shadow-sm">
        <div className="border-b border-gray-100 px-4 py-3 text-sm font-medium text-gray-700">
          最新報名
        </div>
        <ul className="divide-y divide-gray-100">
          {recentOrders.map((order) => (
            <li key={order.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">{order.contactName}</div>
                <div className="text-xs text-gray-500">
                  {order.tour.name} · {order.orderNo}
                </div>
              </div>
              <Link href={`/admin/orders/${order.id}`} className="text-teal-700 hover:underline">
                查看
              </Link>
            </li>
          ))}
          {recentOrders.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-gray-400">尚無報名資料</li>
          )}
        </ul>
      </div>
    </div>
  );
}
