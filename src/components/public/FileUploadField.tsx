"use client";

import { useRef, useState } from "react";

export interface UploadedFileState {
  fileId: string;
  fileName: string;
}

export function FileUploadField({
  fileType,
  value,
  onChange,
  required,
  error,
}: {
  fileType: "PASSPORT" | "BANK_RECEIPT";
  value: UploadedFileState | null;
  onChange: (value: UploadedFileState | null) => void;
  required?: boolean;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setLocalError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", fileType);

      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setLocalError(data.error ?? "上傳失敗，請重新選擇檔案");
        onChange(null);
        return;
      }

      onChange({ fileId: data.fileId, fileName: data.originalName ?? file.name });
    } catch {
      setLocalError("上傳失敗，請確認網路連線後重試");
      onChange(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-3">
        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          {uploading ? "上傳中..." : value ? "重新選擇檔案" : "選擇檔案"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
        {value && !uploading && (
          <span className="truncate text-sm text-gray-600">✓ {value.fileName}</span>
        )}
      </div>
      <p className="text-xs text-gray-500">接受 JPG、PNG 圖片或 PDF，檔案大小上限 10MB</p>
      {required && !value && !localError && !error && (
        <p className="text-xs text-gray-400">尚未上傳</p>
      )}
      {(localError || error) && <p className="text-xs text-red-600">{localError ?? error}</p>}
    </div>
  );
}
