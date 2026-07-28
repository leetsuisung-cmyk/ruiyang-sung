import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedForOrder } from "@/lib/auth/order-authorization";
import { readUploadedFile } from "@/lib/files/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const file = await prisma.uploadedFile.findUnique({ where: { id: fileId } });
  if (!file) {
    return NextResponse.json({ error: "找不到檔案" }, { status: 404 });
  }

  const token = new URL(request.url).searchParams.get("token");
  const authorized = !!file.orderId && (await isAuthorizedForOrder(file.orderId, token));
  if (!authorized) {
    return NextResponse.json({ error: "無權限存取此檔案" }, { status: 403 });
  }

  const buffer = await readUploadedFile(file.storedPath);
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(file.originalName)}`,
    },
  });
}
