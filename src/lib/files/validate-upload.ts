const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "application/pdf"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// magic number 前綴，避免只信任瀏覽器回報的 Content-Type
const MAGIC_NUMBERS: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
];

export interface UploadValidationResult {
  ok: boolean;
  error?: string;
}

export function validateUpload(
  buffer: Buffer,
  reportedMimeType: string,
  sizeBytes: number
): UploadValidationResult {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { ok: false, error: "檔案大小不可超過 10MB" };
  }

  if (!ALLOWED_MIME_TYPES.has(reportedMimeType)) {
    return { ok: false, error: "僅接受 JPG、PNG 圖片或 PDF 檔案" };
  }

  const matchesMagicNumber = MAGIC_NUMBERS.some(
    ({ mime, bytes }) =>
      mime === reportedMimeType && bytes.every((b, i) => buffer[i] === b)
  );

  if (!matchesMagicNumber) {
    return { ok: false, error: "檔案內容與副檔名不符，請確認檔案是否正確" };
  }

  return { ok: true };
}
