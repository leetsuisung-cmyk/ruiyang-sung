import { formatCurrency } from "@/lib/datetime";
import type { FeeCalculationResult } from "@/lib/fee-calculation";

export function FeeSummary({
  pricePerPerson,
  memberCount,
  fees,
}: {
  pricePerPerson: number;
  memberCount: number;
  fees: FeeCalculationResult;
}) {
  const rows: { label: string; value: string; emphasis?: boolean }[] = [
    { label: `每人團費 x ${memberCount} 人`, value: formatCurrency(fees.subtotal) },
    { label: "優惠金額", value: `- ${formatCurrency(fees.totalDiscount)}` },
    { label: "應收合計", value: formatCurrency(fees.totalDue), emphasis: true },
    { label: "應繳訂金", value: formatCurrency(fees.depositRequired), emphasis: true },
    { label: "尾款（出發前繳清）", value: formatCurrency(fees.balanceDue) },
  ];

  return (
    <div className="rounded-xl bg-teal-50 p-4">
      <div className="mb-2 text-xs text-gray-500">每人團費 {formatCurrency(pricePerPerson)}</div>
      <dl className="flex flex-col gap-1.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <dt className={`text-sm ${row.emphasis ? "font-medium text-gray-900" : "text-gray-600"}`}>
              {row.label}
            </dt>
            <dd className={`text-sm ${row.emphasis ? "font-bold text-teal-800" : "text-gray-700"}`}>
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
