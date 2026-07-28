import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  rooms: z.array(z.object({ memberId: z.string().min(1), roomNo: z.string().trim().max(20) })),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "資料格式錯誤" }, { status: 400 });
  }

  const members = await prisma.member.findMany({ where: { orderId } });
  const memberIds = new Set(members.map((m) => m.id));

  for (const room of parsed.data.rooms) {
    if (!memberIds.has(room.memberId)) {
      return NextResponse.json({ error: "團員資料不屬於此訂單" }, { status: 400 });
    }
  }

  await prisma.$transaction(
    parsed.data.rooms.map((room) =>
      prisma.member.update({ where: { id: room.memberId }, data: { roomNo: room.roomNo || null } })
    )
  );

  return NextResponse.json({ ok: true });
}
