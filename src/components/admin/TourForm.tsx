"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName } from "@/components/ui/FormField";

export interface TourFormValues {
  name: string;
  departureCountry: string;
  departureDate: string; // yyyy-mm-dd
  days: number;
  pricePerPerson: number;
  discountAmount: number;
  discountMode: "PER_PERSON" | "FLAT_GROUP";
  depositAmount: number;
  depositMode: "PER_PERSON" | "FLAT_GROUP";
  isActive: boolean;
}

const DEFAULT_VALUES: TourFormValues = {
  name: "",
  departureCountry: "",
  departureDate: "",
  days: 5,
  pricePerPerson: 0,
  discountAmount: 0,
  discountMode: "FLAT_GROUP",
  depositAmount: 0,
  depositMode: "PER_PERSON",
  isActive: true,
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

        <FormField label="出發國家／目的地" htmlFor="departureCountry" required>
          <input
            id="departureCountry"
            className={inputClassName}
            value={values.departureCountry}
            onChange={(e) => update("departureCountry", e.target.value)}
            required
          />
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

        <FormField label="是否開放報名" htmlFor="isActive">
          <select
            id="isActive"
            className={inputClassName}
            value={values.isActive ? "true" : "false"}
            onChange={(e) => update("isActive", e.target.value === "true")}
          >
            <option value="true">開放報名</option>
            <option value="false">下架（不開放）</option>
          </select>
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

        <FormField label="應繳訂金 (元)" htmlFor="depositAmount" required>
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

        <FormField label="訂金計算方式" htmlFor="depositMode">
          <select
            id="depositMode"
            className={inputClassName}
            value={values.depositMode}
            onChange={(e) => update("depositMode", e.target.value as TourFormValues["depositMode"])}
          >
            <option value="PER_PERSON">每人固定金額</option>
            <option value="FLAT_GROUP">整團固定金額</option>
          </select>
        </FormField>
      </div>

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
