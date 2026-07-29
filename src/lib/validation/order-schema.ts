import { z } from "zod";

// 台灣手機（09xxxxxxxx）或市話（含區碼，可有/無 - 分隔）
const PHONE_REGEX = /^0\d{1,2}-?\d{6,8}$/;
// 匯款後五碼
const LAST5_REGEX = /^\d{5}$/;
// 護照號碼：英數字，6~9 碼
const PASSPORT_NUMBER_REGEX = /^[A-Za-z0-9]{6,9}$/;
// 護照英文姓名：大寫英文字母、空白、斜線
const PASSPORT_ENGLISH_NAME_REGEX = /^[A-Za-z\s/]+$/;

export const memberSchema = z.object({
  chineseName: z.string().trim().min(2, "請輸入中文姓名"),
  passportEnglishName: z
    .string()
    .trim()
    .min(1, "請輸入護照英文姓名")
    .regex(PASSPORT_ENGLISH_NAME_REGEX, "護照英文姓名僅能輸入英文字母"),
  passportNumber: z
    .string()
    .trim()
    .regex(PASSPORT_NUMBER_REGEX, "護照號碼格式不正確（6~9碼英數字）"),
  passportExpiry: z.coerce.date({ message: "請輸入有效的護照效期" }).refine(
    (d) => d.getTime() > Date.now(),
    "護照已過期或效期無效，請確認"
  ),
  specialDiet: z.string().trim().max(200).optional().or(z.literal("")),
  passportFileId: z.string().min(1, "請上傳護照照片或掃描檔"),
});

export const contactSchema = z.object({
  contactName: z.string().trim().min(2, "請輸入聯絡人姓名"),
  contactPhone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "請輸入有效的聯絡電話"),
  contactEmail: z.email("請輸入有效的 Email"),
});

export const bankTransferSchema = z.object({
  paymentMethod: z.literal("BANK_TRANSFER"),
  bankTransferLast5: z
    .string()
    .trim()
    .regex(LAST5_REGEX, "匯款後五碼須為 5 位數字"),
  bankReceiptFileId: z.string().optional(),
});

export const creditCardSchema = z.object({
  paymentMethod: z.literal("CREDIT_CARD"),
});

export const paymentInfoSchema = z.discriminatedUnion("paymentMethod", [
  bankTransferSchema,
  creditCardSchema,
]);

export const createOrderSchema = z
  .object({
    tourId: z.string().min(1),
    memberCount: z.coerce.number().int().min(1, "報名人數至少為 1 人"),
    members: z.array(memberSchema).min(1, "請至少填寫一位團員資料"),
  })
  .extend(contactSchema.shape)
  .and(paymentInfoSchema)
  .refine((data) => data.memberCount === data.members.length, {
    message: "報名人數與團員資料筆數不一致",
    path: ["members"],
  });

export type MemberInput = z.infer<typeof memberSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
