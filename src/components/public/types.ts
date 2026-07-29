export interface MemberFormState {
  chineseName: string;
  phone: string;
  specialDiet: string;
}

export const EMPTY_MEMBER: MemberFormState = {
  chineseName: "",
  phone: "",
  specialDiet: "",
};

export type MemberFieldErrors = Partial<Record<keyof MemberFormState, string>>;
