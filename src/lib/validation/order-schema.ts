import { z } from "zod";

// 台灣手機（09xxxxxxxx）或市話（含區碼，可有/無 - 分隔）
const PHONE_REGEX = /^0\d{1,2}-?\d{6,8}$/;
// 匯款後五碼
const LAST5_REGEX = /^\d{5}$/;

// 團員只需填姓名與電話，護照資料改為線下提供
export const memberSchema = z.object({
  chineseName: z.string().trim().min(2, "請輸入姓名"),
  phone: z.string().trim().regex(PHONE_REGEX, "請輸入有效的連絡電話"),
  specialDiet: z.string().trim().max(200).optional().or(z.literal("")),
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
    // 行程資料：客人可自行輸入/修改（預設帶入開團設定）
    tourCode: z
      .string()
      .trim()
      .max(50, "團號長度不可超過 50 字")
      .transform((v) => (v === "" ? null : v))
      .nullish()
      .default(null),
    departureCountry: z.string().trim().min(1, "請輸入出發國家／目的地"),
    departureDate: z.coerce.date({ message: "請輸入有效的出發日期" }),
    days: z.coerce.number().int().min(1, "天數至少為 1 天"),
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
