import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";

export default async function AdminToursPage() {
  const tours = await prisma.tour.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">團體管理</h1>
        <Link href="/admin/tours/new">
          <Button>+ 新增團體</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">團名</th>
              <th className="px-4 py-3">出發日期</th>
              <th className="px-4 py-3">每人團費</th>
              <th className="px-4 py-3">訂單數</th>
              <th className="px-4 py-3">狀態</th>
              <th className="px-4 py-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {tours.map((tour) => (
              <tr key={tour.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">
                    {tour.name}
                    {tour.tourCode && (
                      <span className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-normal text-gray-500">
                        {tour.tourCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{tour.departureCountry}</div>
                </td>
                <td className="px-4 py-3">{formatDate(tour.departureDate)}</td>
                <td className="px-4 py-3">{formatCurrency(tour.pricePerPerson)}</td>
                <td className="px-4 py-3">{tour._count.orders}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      tour.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tour.isActive ? "開放中" : "已下架"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/tours/${tour.id}`} className="text-teal-700 hover:underline">
                      編輯
                    </Link>
                    <Link
                      href={`/tour/${tour.id}`}
                      target="_blank"
                      className="text-gray-500 hover:underline"
                    >
                      查看報名頁
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
            {tours.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  尚未建立任何團體
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
