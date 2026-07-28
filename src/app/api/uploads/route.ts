import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/files/storage";
import { validateUpload } from "@/lib/files/validate-upload";

const ALLOWED_FILE_TYPES = new Set(["PASSPORT", "BANK_RECEIPT"]);

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "上傳格式錯誤" }, { status: 400 });
  }

  const file = formData.get("file");
  const fileType = formData.get("fileType");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "請選擇要上傳的檔案" }, { status: 400 });
  }
  if (typeof fileType !== "string" || !ALLOWED_FILE_TYPES.has(fileType)) {
    return NextResponse.json({ error: "檔案類型參數錯誤" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const validation = validateUpload(buffer, file.type, buffer.length);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const { storedPath, sizeBytes } = await saveUploadedFile(buffer, file.name);

  const uploaded = await prisma.uploadedFile.create({
    data: {
      originalName: file.name,
      storedPath,
      mimeType: file.type,
      sizeBytes,
      fileType: fileType as "PASSPORT" | "BANK_RECEIPT",
    },
  });

  return NextResponse.json({ fileId: uploaded.id, originalName: uploaded.originalName });
}
