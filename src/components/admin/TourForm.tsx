"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateFees } from "@/lib/fee-calculation";
import { formatCurrency } from "@/lib/datetime";
import { COUNTRY_OPTIONS } from "@/lib/constants/countries";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";

export interface TourFormValues {
  name: string;
  tourCode: string;
  departureCountry: string;
  departureDate: string; // yyyy-mm-dd
  days: number;
  pricePerPerson: number;
  discountAmount: number;
  discountMode: "PER_PERSON" | "FLAT_GROUP";
  depositAmount: number;
  chargeType: "DEPOSIT" | "BALANCE"; // 此次消費：收訂金合計或尾款合計
  peopleCount: string; // 人數，選填，空字串代表未填
}

const DEFAULT_VALUES: TourFormValues = {
  name: "",
  tourCode: "",
  departureCountry: "",
  departureDate: "",
  days: 5,
  pricePerPerson: 0,
  discountAmount: 0,
  discountMode: "FLAT_GROUP",
  depositAmount: 0,
  chargeType: "DEPOSIT",
  peopleCount: "",
};

export function TourForm({
  initialValues,
  tourId,
}: {
  initialValues?: Partial<TourFormValues>;
  tourId?: string;
}) {
  const router = useRouter();
  const [values, setValues] = useState<TourFormValues>({ ...DEFAULT_VALUES, ...initialValues });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof TourFormValues>(key: K, value: TourFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = tourId ? `/api/admin/tours/${tourId}` : "/api/admin/tours";
      const method = tourId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "儲存失敗");
        return;
      }
      router.push("/admin/tours");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="團名" htmlFor="name" required>
          <input
            id="name"
            className={inputClassName}
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="例如：東北5日"
            required
          />
        </FormField>

        <FormField label="團號" htmlFor="tourCode" hint="選填，自行輸入，例如 TH20260928A">
          <input
            id="tourCode"
            className={inputClassName}
            value={values.tourCode}
            onChange={(e) => update("tourCode", e.target.value)}
            placeholder="自行輸入團號"
          />
        </FormField>

        <FormField
          label="出發國家／目的地"
          htmlFor="departureCountry"
          hint="可下拉選擇常見國家，也可自行輸入"
          required
        >
          <input
            id="departureCountry"
            className={inputClassName}
            list="departureCountryOptions"
            value={values.departureCountry}
            onChange={(e) => update("departureCountry", e.target.value)}
            placeholder="選擇或輸入國家／目的地"
            required
          />
          <datalist id="departureCountryOptions">
            {COUNTRY_OPTIONS.map((country) => (
              <option key={country} value={country} />
            ))}
          </datalist>
        </FormField>

        <FormField label="出發日期" htmlFor="departureDate" required>
          <input
            id="departureDate"
            type="date"
            className={inputClassName}
            value={values.departureDate}
            onChange={(e) => update("departureDate", e.target.value)}
            required
          />
        </FormField>

        <FormField label="天數" htmlFor="days" required>
          <input
            id="days"
            type="number"
            min={1}
            className={inputClassName}
            value={values.days}
            onChange={(e) => update("days", Number(e.target.value))}
            required
          />
        </FormField>

        <FormField label="每人團費金額 (元)" htmlFor="pricePerPerson" required>
          <input
            id="pricePerPerson"
            type="number"
            min={0}
            className={inputClassName}
            value={values.pricePerPerson}
            onChange={(e) => update("pricePerPerson", Number(e.target.value))}
            required
          />
        </FormField>

        <FormField label="人數" htmlFor="peopleCount" hint="選填，自行輸入">
          <input
            id="peopleCount"
            type="number"
            min={1}
            className={inputClassName}
            value={values.peopleCount}
            onChange={(e) => update("peopleCount", e.target.value)}
            placeholder="自行輸入人數"
          />
        </FormField>

        <FormField
          label="優惠金額 (元)"
          htmlFor="discountAmount"
          hint="依右方模式決定是每人折抵還是整團折抵一次"
        >
          <input
            id="discountAmount"
            type="number"
            min={0}
            className={inputClassName}
            value={values.discountAmount}
            onChange={(e) => update("discountAmount", Number(e.target.value))}
          />
        </FormField>

        <FormField label="優惠計算方式" htmlFor="discountMode">
          <select
            id="discountMode"
            className={inputClassName}
            value={values.discountMode}
            onChange={(e) => update("discountMode", e.target.value as TourFormValues["discountMode"])}
          >
            <option value="FLAT_GROUP">整團固定金額</option>
            <option value="PER_PERSON">每人折抵</option>
          </select>
        </FormField>

        <FormField label="訂金（每人）(元)" htmlFor="depositAmount" required>
          <input
            id="depositAmount"
            type="number"
            min={0}
            className={inputClassName}
            value={values.depositAmount}
            onChange={(e) => update("depositAmount", Number(e.target.value))}
            required
          />
        </FormField>

        <FormField
          label="此次消費"
          htmlFor="chargeType"
          hint="決定客人報名時要繳的金額：訂金合計或尾款合計"
        >
          <select
            id="chargeType"
            className={inputClassName}
            value={values.chargeType}
            onChange={(e) => update("chargeType", e.target.value as TourFormValues["chargeType"])}
          >
            <option value="DEPOSIT">訂金</option>
            <option value="BALANCE">尾款</option>
          </select>
        </FormField>
      </div>

      <FeePreview values={values} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "儲存中..." : "儲存"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/admin/tours")}>
          取消
        </Button>
      </div>
    </form>
  );
}

// 金額自動試算：填入人數後即時顯示訂金合計、每人尾款、尾款合計
function FeePreview({ values }: { values: TourFormValues }) {
  const count = Number(values.peopleCount);

  const preview = useMemo(() => {
    if (!Number.isFinite(count) || count < 1) return null;
    return calculateFees(
      {
        pricePerPerson: values.pricePerPerson,
        discountAmount: values.discountAmount,
        discountMode: values.discountMode,
        depositAmount: values.depositAmount,
        depositMode: "PER_PERSON",
      },
      count
    );
  }, [count, values.pricePerPerson, values.discountAmount, values.discountMode, values.depositAmount]);

  if (!preview) {
    return (
      <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-400">
        填入「人數」後，這裡會自動試算訂金合計與尾款合計
      </div>
    );
  }

  // 每人尾款 = 每人團費 - 每人優惠 - 每人訂金（整團固定優惠時以合計換算）
  const balancePerPerson = Math.round(preview.balanceDue / count);
  const chargeNow = values.chargeType === "BALANCE" ? preview.balanceDue : preview.depositRequired;

  return (
    <div className="rounded-xl bg-teal-50 p-4">
      <div className="mb-2 text-xs font-medium text-gray-500">金額自動試算（{count} 人）</div>
      <dl className="flex flex-col gap-1.5 text-sm">
        <PreviewRow label={`每人團費 x ${count} 人`} value={formatCurrency(preview.subtotal)} />
        <PreviewRow label="優惠金額" value={`- ${formatCurrency(preview.totalDiscount)}`} />
        <PreviewRow label="應收合計" value={formatCurrency(preview.totalDue)} />
        <PreviewRow label={`訂金合計（${formatCurrency(values.depositAmount)} x ${count} 人）`} value={formatCurrency(preview.depositRequired)} />
        <PreviewRow label="每人尾款" value={formatCurrency(balancePerPerson)} />
        <PreviewRow label="尾款合計" value={formatCurrency(preview.balanceDue)} />
        <hr className="my-1 border-teal-100" />
        <PreviewRow
          label={`客人報名將繳（此次消費：${values.chargeType === "BALANCE" ? "尾款" : "訂金"}）`}
          value={formatCurrency(chargeNow)}
          emphasis
        />
      </dl>
    </div>
  );
}

function PreviewRow({ label, value, emphasis }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className={emphasis ? "font-medium text-gray-900" : "text-gray-600"}>{label}</dt>
      <dd className={emphasis ? "font-bold text-teal-800" : "text-gray-700"}>{value}</dd>
    </div>
  );
}
