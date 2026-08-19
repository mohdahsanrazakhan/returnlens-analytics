import { Schema, model, models, type InferSchemaType } from "mongoose";
import { CATEGORIES, RETURN_REASONS, PRODUCT_RISK_LEVELS } from "@/lib/constants";

const ReturnsByReasonSchema = new Schema(
  {
    wrong_size: { type: Number, default: 0 },
    damaged: { type: Number, default: 0 },
    not_as_described: { type: Number, default: 0 },
    changed_mind: { type: Number, default: 0 },
    defective: { type: Number, default: 0 },
    wrong_item: { type: Number, default: 0 },
  },
  { _id: false }
);

const ReturnStatsSchema = new Schema(
  {
    totalSold: { type: Number, default: 0 },
    totalReturned: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    returnCost: { type: Number, default: 0 },
    topReturnReason: { type: String, enum: [...RETURN_REASONS, null], default: null },
    avgDaysToReturn: { type: Number, default: 0 },
    returnsByReason: { type: ReturnsByReasonSchema, default: () => ({}) },
  },
  { _id: false }
);

const CodStatsSchema = new Schema(
  {
    totalCODOrders: { type: Number, default: 0 },
    codRejections: { type: Number, default: 0 },
    codRejectionRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true, index: true },
    nameEn: { type: String, required: true, trim: true, maxlength: 200 },
    nameAr: { type: String, required: true, trim: true, maxlength: 200 },
    category: { type: String, enum: CATEGORIES, required: true, index: true },
    subcategory: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    sellingPrice: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0 },

    returnStats: { type: ReturnStatsSchema, default: () => ({}) },
    codStats: { type: CodStatsSchema, default: () => ({}) },

    riskLevel: { type: String, enum: PRODUCT_RISK_LEVELS, default: "low", index: true },
  },
  { timestamps: true, strict: true }
);

ProductSchema.index({ category: 1, riskLevel: 1 });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

export default models.Product || model("Product", ProductSchema);
