import { FormField, inputClassName, inputErrorClassName } from "@/components/ui/FormField";
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
        <FormField label="姓名" htmlFor={`member-${index}-chineseName`} required error={errors?.chineseName}>
          <input
            id={`member-${index}-chineseName`}
            className={errors?.chineseName ? inputErrorClassName : inputClassName}
            value={value.chineseName}
            onChange={(e) => update("chineseName", e.target.value)}
            required
          />
        </FormField>

        <FormField label="電話" htmlFor={`member-${index}-phone`} required error={errors?.phone}>
          <input
            id={`member-${index}-phone`}
            className={errors?.phone ? inputErrorClassName : inputClassName}
            value={value.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="例如：0912345678"
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
    </div>
  );
}
