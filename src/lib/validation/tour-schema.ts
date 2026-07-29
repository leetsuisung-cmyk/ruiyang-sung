import { z } from "zod";

export const discountModeSchema = z.enum(["PER_PERSON", "FLAT_GROUP"]);
export const depositModeSchema = z.enum(["PER_PERSON", "FLAT_GROUP"]);

export const tourSchema = z.object({
  name: z.string().trim().min(1, "請輸入團名"),
  tourCode: z
    .string()
    .trim()
    .max(50, "團號長度不可超過 50 字")
    .transform((v) => (v === "" ? null : v))
    .nullish()
    .default(null),
  departureCountry: z.string().trim().min(1, "請輸入出發國家／目的地"),
  departureDate: z.coerce.date({
    message: "請輸入有效的出發日期",
  }),
  days: z.coerce.number().int().min(1, "天數至少為 1 天"),
  pricePerPerson: z.coerce.number().int().min(0, "每人團費不可為負數"),
  discountAmount: z.coerce.number().int().min(0, "優惠金額不可為負數").default(0),
  discountMode: discountModeSchema.default("FLAT_GROUP"),
  depositAmount: z.coerce.number().int().min(0, "訂金金額不可為負數"),
  depositMode: depositModeSchema.default("PER_PERSON"),
  peopleCount: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(1, "人數至少為 1 人").nullable()
  ).default(null),
});

export type TourInput = z.infer<typeof tourSchema>;
