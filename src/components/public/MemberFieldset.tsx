import { FormField, inputClassName, inputErrorClassName } from "@/components/ui/FormField";
import { FileUploadField } from "./FileUploadField";
import type { MemberFieldErrors, MemberFormState } from "./types";

export function MemberFieldset({
  index,
  value,
  errors,
  onChange,
}: {
  index: number;
  value: MemberFormState;
  errors?: MemberFieldErrors;
  onChange: (value: MemberFormState) => void;
}) {
  function update<K extends keyof MemberFormState>(key: K, v: MemberFormState[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-bold text-gray-900">第 {index + 1} 位團員</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="中文姓名" htmlFor={`member-${index}-chineseName`} required error={errors?.chineseName}>
          <input
            id={`member-${index}-chineseName`}
            className={errors?.chineseName ? inputErrorClassName : inputClassName}
            value={value.chineseName}
            onChange={(e) => update("chineseName", e.target.value)}
            required
          />
        </FormField>

        <FormField
          label="護照英文姓名"
          htmlFor={`member-${index}-passportEnglishName`}
          required
          hint="請依護照上英文姓名填寫，例如：WANG/XIAOMING"
          error={errors?.passportEnglishName}
        >
          <input
            id={`member-${index}-passportEnglishName`}
            className={errors?.passportEnglishName ? inputErrorClassName : inputClassName}
            value={value.passportEnglishName}
            onChange={(e) => update("passportEnglishName", e.target.value.toUpperCase())}
            required
          />
        </FormField>

        <FormField label="護照號碼" htmlFor={`member-${index}-passportNumber`} required error={errors?.passportNumber}>
          <input
            id={`member-${index}-passportNumber`}
            className={errors?.passportNumber ? inputErrorClassName : inputClassName}
            value={value.passportNumber}
            onChange={(e) => update("passportNumber", e.target.value.toUpperCase())}
            required
          />
        </FormField>

        <FormField label="護照效期" htmlFor={`member-${index}-passportExpiry`} required error={errors?.passportExpiry}>
          <input
            id={`member-${index}-passportExpiry`}
            type="date"
            className={errors?.passportExpiry ? inputErrorClassName : inputClassName}
            value={value.passportExpiry}
            onChange={(e) => update("passportExpiry", e.target.value)}
            required
          />
        </FormField>

        <FormField
          label="特殊飲食需求"
          htmlFor={`member-${index}-specialDiet`}
          hint="例如：素食、不吃牛、過敏，可留空"
        >
          <input
            id={`member-${index}-specialDiet`}
            className={inputClassName}
            value={value.specialDiet}
            onChange={(e) => update("specialDiet", e.target.value)}
          />
        </FormField>
      </div>

      <FormField label="護照照片／掃描檔" required error={errors?.passportFile}>
        <FileUploadField
          fileType="PASSPORT"
          value={value.passportFile}
          onChange={(v) => update("passportFile", v)}
          required
          error={errors?.passportFile}
        />
      </FormField>
    </div>
  );
}
