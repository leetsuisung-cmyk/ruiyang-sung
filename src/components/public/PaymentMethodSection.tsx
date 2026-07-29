import { COMPANY } from "@/lib/constants/company";
import { FormField, inputClassName, inputErrorClassName } from "@/components/ui/FormField";
import { FileUploadField, type UploadedFileState } from "./FileUploadField";

export type PaymentMethod = "CREDIT_CARD" | "BANK_TRANSFER";

export function PaymentMethodSection({
  method,
  onMethodChange,
  bankTransferLast5,
  onBankTransferLast5Change,
  bankReceiptFile,
  onBankReceiptFileChange,
  errors,
}: {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  bankTransferLast5: string;
  onBankTransferLast5Change: (value: string) => void;
  bankReceiptFile: UploadedFileState | null;
  onBankReceiptFileChange: (value: UploadedFileState | null) => void;
  errors?: { bankTransferLast5?: string };
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label
          className={`cursor-pointer rounded-xl border p-4 ${
            method === "CREDIT_CARD" ? "border-teal-600 bg-teal-50" : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            className="mr-2"
            checked={method === "CREDIT_CARD"}
            onChange={() => onMethodChange("CREDIT_CARD")}
          />
          <span className="font-medium text-gray-900">線上刷卡</span>
          <p className="mt-1 text-xs text-gray-500">送出後導轉至安全付款頁面完成刷卡</p>
        </label>

        <label
          className={`cursor-pointer rounded-xl border p-4 ${
            method === "BANK_TRANSFER" ? "border-teal-600 bg-teal-50" : "border-gray-200 bg-white"
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            className="mr-2"
            checked={method === "BANK_TRANSFER"}
            onChange={() => onMethodChange("BANK_TRANSFER")}
          />
          <span className="font-medium text-gray-900">銀行匯款</span>
          <p className="mt-1 text-xs text-gray-500">匯款後填寫後五碼，我們將人工核對</p>
        </label>
      </div>

      {method === "BANK_TRANSFER" && (
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            <div>
              匯款銀行：{COMPANY.bank.bankName} {COMPANY.bank.branchName}
            </div>
            <div>戶名：{COMPANY.bank.accountName}</div>
            <div>帳號：{COMPANY.bank.accountNumber}</div>
          </div>

          <FormField
            label="匯款後五碼"
            htmlFor="bankTransferLast5"
            required
            error={errors?.bankTransferLast5}
          >
            <input
              id="bankTransferLast5"
              className={errors?.bankTransferLast5 ? inputErrorClassName : inputClassName}
              value={bankTransferLast5}
              maxLength={5}
              inputMode="numeric"
              onChange={(e) => onBankTransferLast5Change(e.target.value.replace(/\D/g, ""))}
              placeholder="例如：12345"
              required
            />
          </FormField>

          <FormField label="匯款收據截圖" hint="選填，上傳後可加速核對">
            <FileUploadField
              fileType="BANK_RECEIPT"
              value={bankReceiptFile}
              onChange={onBankReceiptFileChange}
            />
          </FormField>
        </div>
      )}
    </div>
  );
}
