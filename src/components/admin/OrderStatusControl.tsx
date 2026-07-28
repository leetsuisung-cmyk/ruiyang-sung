"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PAYMENT_STATUS_LABELS } from "@/lib/labels";

const STATUS_OPTIONS = ["UNPAID", "DEPOSIT_PAID", "FULLY_PAID"] as const;

export function OrderStatusControl({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error ?? "更新失敗");
        return;
      }
      setMessage("已更新，若轉為已付款狀態將自動寄送正式收據信");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleResendReceipt() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/send-receipt`, { method: "POST" });
      setMessage(res.ok ? "已重新寄送收據信" : "寄送失敗，請查看伺服器 log");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <Button onClick={handleSave} disabled={saving || status === currentStatus}>
          更新狀態
        </Button>
        <Button variant="secondary" onClick={handleResendReceipt} disabled={saving}>
          重寄收據信
        </Button>
      </div>
      {message && <p className="text-xs text-gray-500">{message}</p>}
    </div>
  );
}
