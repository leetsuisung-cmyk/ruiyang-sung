import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/datetime";
import { COMPANY } from "@/lib/constants/company";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const tours = await prisma.tour.findMany({
    where: { isActive: true },
    orderBy: { departureDate: "asc" },
  });

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">{COMPANY.name}</h1>
        <p className="mt-1 text-sm text-gray-500">線上報名與收訂金系統</p>
      </div>

      <div className="flex flex-col gap-3">
        {tours.map((tour) => (
          <Link
            key={tour.id}
            href={`/tour/${tour.id}`}
            className="rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="font-bold text-gray-900">{tour.name}</div>
            <div className="text-sm text-gray-500">{tour.departureCountry}</div>
            <div className="mt-1 text-sm text-teal-700">
              出發日期：{formatDate(tour.departureDate)}（{tour.days} 天）
            </div>
          </Link>
        ))}
        {tours.length === 0 && (
          <p className="text-center text-sm text-gray-400">目前尚無開放報名的團體，請洽承辦人。</p>
        )}
      </div>

      <p className="text-center text-xs text-gray-400">
        如有任何問題請洽承辦人 {COMPANY.contactPerson} {COMPANY.phone}
      </p>
    </div>
  );
}
