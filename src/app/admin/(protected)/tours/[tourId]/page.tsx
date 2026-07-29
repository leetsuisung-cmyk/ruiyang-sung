import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TourForm } from "@/components/admin/TourForm";

export default async function EditTourPage({
  params,
}: {
  params: Promise<{ tourId: string }>;
}) {
  const { tourId } = await params;
  const tour = await prisma.tour.findUnique({ where: { id: tourId } });
  if (!tour) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">編輯團體</h1>
      <TourForm
        tourId={tour.id}
        initialValues={{
          name: tour.name,
          tourCode: tour.tourCode ?? "",
          departureCountry: tour.departureCountry,
          departureDate: tour.departureDate.toISOString().slice(0, 10),
          days: tour.days,
          pricePerPerson: tour.pricePerPerson,
          discountAmount: tour.discountAmount,
          discountMode: tour.discountMode,
          depositAmount: tour.depositAmount,
          depositMode: tour.depositMode,
          isActive: tour.isActive,
        }}
      />
    </div>
  );
}
