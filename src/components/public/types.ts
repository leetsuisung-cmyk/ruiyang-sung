import type { UploadedFileState } from "./FileUploadField";

export interface MemberFormState {
  chineseName: string;
  passportEnglishName: string;
  passportNumber: string;
  passportExpiry: string; // yyyy-mm-dd
  specialDiet: string;
  passportFile: UploadedFileState | null;
}

export const EMPTY_MEMBER: MemberFormState = {
  chineseName: "",
  passportEnglishName: "",
  passportNumber: "",
  passportExpiry: "",
  specialDiet: "",
  passportFile: null,
};

export type MemberFieldErrors = Partial<Record<keyof MemberFormState, string>>;
