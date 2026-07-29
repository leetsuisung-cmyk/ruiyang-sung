import { formatCurrency } from "@/lib/datetime";
import type { FeeCalculationResult } from "@/lib/fee-calculation";

export function FeeSummary({
  pricePerPerson,
  memberCount,
  fees,
  chargeType = "DEPOSIT",
}: {
  pricePerPerson: number;
  memberCount: number;
  fees: FeeCalculationResult;
  chargeType?: "DEPOSIT" | "BALANCE";
}) {
  // 每人訂金/每人尾款：由合計除以人數回推，與請款單 PDF 的計算式一致
  const depositPerPerson = Math.round(fees.depositRequired / memberCount);
  const balancePerPerson = Math.round(fees.balanceDue / memberCount);
  const chargeNow = chargeType === "BALANCE" ? fees.balanceDue : fees.depositRequired;

  const rows: { label: string; value: string; emphasis?: boolean }[] = [
    { label: `每人團費 ${formatCurrency(pricePerPerson)} x ${memberCount} 人`, value: formatCurrency(fees.subtotal) },
    { label: "優惠金額", value: `- ${formatCurrency(fees.totalDiscount)}` },
    { label: "團費合計", value: formatCurrency(fees.totalDue), emphasis: true },
    {
      label: `訂金合計（${formatCurrency(depositPerPerson)} x ${memberCount} 人）`,
      value: formatCurrency(fees.depositRequired),
    },
    { label: "每人尾款（每人團費 - 優惠 - 每人訂金）", value: formatCurrency(balancePerPerson) },
    {
      label: `尾款合計（${formatCurrency(balancePerPerson)} x ${memberCount} 人）`,
      value: formatCurrency(fees.balanceDue),
    },
    {
      label: chargeType === "BALANCE" ? "此次應繳（尾款合計）" : "此次應繳（訂金合計）",
      value: formatCurrency(chargeNow),
      emphasis: true,
    },
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
