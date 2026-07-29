"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { calculateFees, type DepositMode, type DiscountMode } from "@/lib/fee-calculation";
import { createOrderSchema } from "@/lib/validation/order-schema";
import { Button } from "@/components/ui/Button";
import { FormField, inputClassName, inputErrorClassName } from "@/components/ui/FormField";
import { FeeSummary } from "./FeeSummary";
import { MemberFieldset } from "./MemberFieldset";
import { PaymentMethodSection, type PaymentMethod } from "./PaymentMethodSection";
import { EMPTY_MEMBER, type MemberFieldErrors, type MemberFormState } from "./types";
import type { UploadedFileState } from "./FileUploadField";

export interface TourSummary {
  id: string;
  name: string;
  pricePerPerson: number;
  discountAmount: number;
  discountMode: DiscountMode;
  depositAmount: number;
  depositMode: DepositMode;
  chargeType: "DEPOSIT" | "BALANCE"; // 此次消費收訂金或尾款
}

interface FormErrors {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  memberCount?: string;
  membersGeneral?: string;
  bankTransferLast5?: string;
  general?: string;
}

export function RegistrationForm({ tour }: { tour: TourSummary }) {
  const router = useRouter();

  const [memberCount, setMemberCount] = useState(1);
  const [members, setMembers] = useState<MemberFormState[]>([{ ...EMPTY_MEMBER }]);
  const [memberErrors, setMemberErrors] = useState<MemberFieldErrors[]>([{}]);

  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [bankTransferLast5, setBankTransferLast5] = useState("");
  const [bankReceiptFile, setBankReceiptFile] = useState<UploadedFileState | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const fees = useMemo(() => calculateFees(tour, memberCount), [tour, memberCount]);

  // 此次消費：依團體設定決定本次要收訂金合計還是尾款合計
  const chargeWord = tour.chargeType === "BALANCE" ? "尾款" : "訂金";
  const chargeNow = tour.chargeType === "BALANCE" ? fees.balanceDue : fees.depositRequired;

  function handleMemberCountChange(rawValue: number) {
    const newCount = Math.max(1, Number.isFinite(rawValue) ? Math.floor(rawValue) : 1);

    if (newCount < members.length) {
      const toRemove = members.slice(newCount);
      const hasData = toRemove.some(
        (m) => m.chineseName.trim() || m.passportEnglishName.trim() || m.passportNumber.trim() || m.passportFile
      );
      if (
        hasData &&
        typeof window !== "undefined" &&
        !window.confirm(`減少人數將刪除第 ${newCount + 1} 位以後已填寫的團員資料，確定要繼續嗎？`)
      ) {
        return;
      }
    }

    setMemberCount(newCount);
    setMembers((prev) => {
      if (newCount > prev.length) {
        return [...prev, ...Array.from({ length: newCount - prev.length }, () => ({ ...EMPTY_MEMBER }))];
      }
      return prev.slice(0, newCount);
    });
    setMemberErrors((prev) => {
      if (newCount > prev.length) {
        return [...prev, ...Array.from({ length: newCount - prev.length }, () => ({}))];
      }
      return prev.slice(0, newCount);
    });
  }

  function updateMember(index: number, value: MemberFormState) {
    setMembers((prev) => prev.map((m, i) => (i === index ? value : m)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload = {
      tourId: tour.id,
      memberCount,
      members: members.map((m) => ({
        chineseName: m.chineseName,
        passportEnglishName: m.passportEnglishName,
        passportNumber: m.passportNumber,
        passportExpiry: m.passportExpiry,
        specialDiet: m.specialDiet,
        passportFileId: m.passportFile?.fileId ?? "",
      })),
      contactName,
      contactPhone,
      contactEmail,
      paymentMethod,
      ...(paymentMethod === "BANK_TRANSFER"
        ? { bankTransferLast5, bankReceiptFileId: bankReceiptFile?.fileId }
        : {}),
    };

    const parsed = createOrderSchema.safeParse(payload);
    if (!parsed.success) {
      const nextMemberErrors: MemberFieldErrors[] = members.map(() => ({}));
      const nextErrors: FormErrors = {};

      for (const issue of parsed.error.issues) {
        const [root, idx, field] = issue.path;
        if (root === "members" && typeof idx === "number" && typeof field === "string") {
          nextMemberErrors[idx] = { ...nextMemberErrors[idx], [field]: issue.message };
        } else if (root === "members") {
          nextErrors.membersGeneral = issue.message;
        } else if (root === "bankTransferLast5") {
          nextErrors.bankTransferLast5 = issue.message;
        } else if (typeof root === "string") {
          (nextErrors as Record<string, string>)[root] = issue.message;
        }
      }

      setMemberErrors(nextMemberErrors);
      setErrors(nextErrors);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({ general: data.error ?? "送出失敗，請稍後再試" });
        return;
      }

      if (data.paymentMethod === "CREDIT_CARD") {
        const checkoutRes = await fetch("/api/payment/trustpay/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId }),
        });
        const checkoutData = await checkoutRes.json().catch(() => ({}));
        if (checkoutRes.ok && checkoutData.checkoutUrl) {
          window.location.href = checkoutData.checkoutUrl;
          return;
        }
      }

      router.push(`/tour/${tour.id}/success/${data.orderId}?t=${data.token}`);
    } catch {
      setErrors({ general: "網路連線異常，請稍後再試" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 pb-16">
      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-gray-900">費用試算</h2>
        <FormField label="報名人數" htmlFor="memberCount" required>
          <input
            id="memberCount"
            type="number"
            min={1}
            className={inputClassName}
            value={memberCount}
            onChange={(e) => handleMemberCountChange(Number(e.target.value))}
          />
        </FormField>
        <div className="mt-3">
          <FeeSummary
            pricePerPerson={tour.pricePerPerson}
            memberCount={memberCount}
            fees={fees}
            chargeType={tour.chargeType}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">報名聯絡人資料</h2>
        <FormField label="姓名" htmlFor="contactName" required error={errors.contactName}>
          <input
            id="contactName"
            className={errors.contactName ? inputErrorClassName : inputClassName}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            required
          />
        </FormField>
        <FormField label="連絡電話" htmlFor="contactPhone" required error={errors.contactPhone}>
          <input
            id="contactPhone"
            className={errors.contactPhone ? inputErrorClassName : inputClassName}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="例如：0912345678"
            required
          />
        </FormField>
        <FormField label="Email" htmlFor="contactEmail" required error={errors.contactEmail}>
          <input
            id="contactEmail"
            type="email"
            className={errors.contactEmail ? inputErrorClassName : inputClassName}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            required
          />
        </FormField>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-bold text-gray-900">團員資料</h2>
        {errors.membersGeneral && <p className="text-xs text-red-600">{errors.membersGeneral}</p>}
        {members.map((member, index) => (
          <MemberFieldset
            key={index}
            index={index}
            value={member}
            errors={memberErrors[index]}
            onChange={(v) => updateMember(index, v)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900">繳交{chargeWord}方式</h2>
        <PaymentMethodSection
          method={paymentMethod}
          onMethodChange={setPaymentMethod}
          bankTransferLast5={bankTransferLast5}
          onBankTransferLast5Change={setBankTransferLast5}
          bankReceiptFile={bankReceiptFile}
          onBankReceiptFileChange={setBankReceiptFile}
          errors={{ bankTransferLast5: errors.bankTransferLast5 }}
        />
      </section>

      {errors.general && <p className="text-sm text-red-600">{errors.general}</p>}

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white p-4 shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <div className="mx-auto max-w-2xl">
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "送出中..." : `送出報名（應繳${chargeWord} ${chargeNow.toLocaleString("zh-TW")} 元）`}
          </Button>
        </div>
      </div>
    </form>
  );
}
