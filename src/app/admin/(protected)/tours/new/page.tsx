import { TourForm } from "@/components/admin/TourForm";

export default function NewTourPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-bold text-gray-900">新增團體</h1>
      <TourForm />
    </div>
  );
}
