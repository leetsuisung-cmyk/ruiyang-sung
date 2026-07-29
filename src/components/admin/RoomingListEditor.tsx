"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface RoomingMember {
  id: string;
  chineseName: string;
  phone: string;
  specialDiet: string | null;
  roomNo: string | null;
}

export function RoomingListEditor({
  orderId,
  members,
}: {
  orderId: string;
  members: RoomingMember[];
}) {
  const [roomNos, setRoomNos] = useState<Record<string, string>>(
    Object.fromEntries(members.map((m) => [m.id, m.roomNo ?? ""]))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/rooming-list`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rooms: members.map((m) => ({ memberId: m.id, roomNo: roomNos[m.id] ?? "" })),
        }),
      });
      setMessage(res.ok ? "已儲存 ROOM NO" : "儲存失敗");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-3 py-2">ROOM NO</th>
              <th className="px-3 py-2">姓名</th>
              <th className="px-3 py-2">電話</th>
              <th className="px-3 py-2">特殊飲食</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-3 py-2">
                  <input
                    className="w-24 rounded-lg border border-gray-300 px-2 py-1"
                    value={roomNos[m.id] ?? ""}
                    onChange={(e) => setRoomNos((prev) => ({ ...prev, [m.id]: e.target.value }))}
                  />
                </td>
                <td className="px-3 py-2">{m.chineseName}</td>
                <td className="px-3 py-2">{m.phone || "-"}</td>
                <td className="px-3 py-2">{m.specialDiet || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={handleSave} disabled={saving}>
          儲存 ROOM NO
        </Button>
        {message && <span className="text-xs text-gray-500">{message}</span>}
      </div>
    </div>
  );
}
