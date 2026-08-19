import { z } from "zod";
import {
  CATEGORIES,
  CHANNELS,
  COUNTRIES,
  CURRENCIES,
  RETURN_REASONS,
  RISK_LEVELS,
  PRODUCT_RISK_LEVELS,
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_STATUSES,
  RECOMMENDATION_TYPES,
} from "@/lib/constants";

// ---- Shared primitives (Section 3.7) ----

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const objectIdSchema = z.string().regex(objectIdRegex, "Invalid id format");

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().max(100000).default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const searchSchema = z
  .string()
  .max(100)
  .transform((s) => s.replace(/<[^>]*>/g, "").trim())
  .optional();

export const periodSchema = z.enum(["7d", "30d", "90d", "12m", "custom"]).default("30d");

export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (d) => {
      if (!d.startDate || !d.endDate) return true;
      if (d.startDate >= d.endDate) return false;
      const spanDays = (d.endDate.getTime() - d.startDate.getTime()) / (1000 * 60 * 60 * 24);
      return spanDays <= 365;
    },
    { message: "Invalid date range: start must be before end, and span must not exceed 365 days" }
  );

export const currencySchema = z.enum(CURRENCIES).default("SAR");

// ---- Login ----
export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

// ---- Dashboard ----
export const dashboardQuerySchema = z.object({
  period: periodSchema,
  currency: currencySchema,
});

// ---- Returns ----
export const returnsQuerySchema = z.object({
  period: periodSchema,
  category: z.enum(CATEGORIES).optional(),
  city: z.string().max(50).optional(),
  channel: z.enum(CHANNELS).optional(),
  reason: z.enum(RETURN_REASONS).optional(),
});

// ---- COD ----
export const codQuerySchema = z.object({
  period: periodSchema,
  city: z.string().max(50).optional(),
});

// ---- Products ----
export const productsQuerySchema = paginationSchema.extend({
  category: z.enum(CATEGORIES).optional(),
  risk: z.enum(PRODUCT_RISK_LEVELS).or(z.literal("all")).optional(),
  sort: z.enum(["returnRate", "codRejectionRate", "totalLoss", "unitsSold"]).default("returnRate"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: searchSchema,
  channel: z.enum(CHANNELS).optional(),
});

// ---- Customers ----
export const customersQuerySchema = paginationSchema.extend({
  risk: z.enum(RISK_LEVELS).or(z.literal("all")).optional(),
  city: z.string().max(50).optional(),
  country: z.enum(COUNTRIES).optional(),
  sort: z.enum(["riskScore", "totalOrders", "returnRate", "codRejectionRate"]).default("riskScore"),
  order: z.enum(["asc", "desc"]).default("desc"),
  search: searchSchema,
});

// ---- Recommendations ----
export const recommendationsQuerySchema = z.object({
  priority: z.enum(RECOMMENDATION_PRIORITIES).optional(),
  status: z.enum(RECOMMENDATION_STATUSES).optional(),
  type: z.enum(RECOMMENDATION_TYPES).optional(),
});

export const recommendationPatchSchema = z.object({
  status: z.enum(RECOMMENDATION_STATUSES),
});

// ---- AI input sanitization (Section 3.5) ----
export function sanitizeAiInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 300);
}
