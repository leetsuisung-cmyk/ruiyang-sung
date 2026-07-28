import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/datetime";
import { COMPANY } from "@/lib/constants/company";
import { RegistrationForm } from "@/components/public/RegistrationForm";

export default async function TourRegistrationPage({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });

  if (!tour || !tour.isActive) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-lg font-bold text-gray-900">找不到此團體或已停止報名</h1>
        <p className="text-sm text-gray-500">
          如有疑問請洽承辦人 {COMPANY.contactPerson} {COMPANY.phone}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <div className="mb-4 rounded-xl bg-white p-4 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">{tour.name}</h1>
        <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
          <dt className="text-gray-400">出發國家／目的地</dt>
          <dd>{tour.departureCountry}</dd>
          <dt className="text-gray-400">出發日期</dt>
          <dd>{formatDate(tour.departureDate)}</dd>
          <dt className="text-gray-400">天數</dt>
          <dd>{tour.days} 天</dd>
        </dl>
      </div>

      <RegistrationForm
        tour={{
          id: tour.id,
          name: tour.name,
          pricePerPerson: tour.pricePerPerson,
          discountAmount: tour.discountAmount,
          discountMode: tour.discountMode,
          depositAmount: tour.depositAmount,
          depositMode: tour.depositMode,
        }}
      />
    </div>
  );
}
