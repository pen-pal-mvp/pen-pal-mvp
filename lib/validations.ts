import { z } from "zod";

export const textValidationSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: "1文字以上の入力が必要です" })
    .max(1000, { message: "テキストは1000文字以内にしてください" }),
});

export const singleStringSchema = z
  .string()
  .trim()
  .min(1, { message: "1文字以上の入力が必要です" })
  .max(1000, { message: "テキストは1000文字以内にしてください" });