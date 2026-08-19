import { Schema, model, models, type InferSchemaType } from "mongoose";
import { COUNTRIES, RISK_LEVELS } from "@/lib/constants";

const StatsSchema = new Schema(
  {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalReturns: { type: Number, default: 0 },
    returnRate: { type: Number, default: 0 },
    totalCODOrders: { type: Number, default: 0 },
    codRejections: { type: Number, default: 0 },
    codRejectionRate: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    firstOrderDate: { type: Date, default: null },
    lastOrderDate: { type: Date, default: null },
    daysSinceLastOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: { type: String, required: true, index: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    city: { type: String, required: true, index: true },
    country: { type: String, enum: COUNTRIES, required: true, index: true },

    stats: { type: StatsSchema, default: () => ({}) },

    riskScore: { type: Number, min: 0, max: 100, default: 0, index: true },
    riskLevel: { type: String, enum: RISK_LEVELS, default: "low", index: true },
    riskFactors: { type: [String], default: [] },
  },
  { timestamps: true, strict: true }
);

CustomerSchema.index({ riskLevel: 1, riskScore: -1 });
CustomerSchema.index({ city: 1, country: 1 });

export type CustomerDoc = InferSchemaType<typeof CustomerSchema>;

export default models.Customer || model("Customer", CustomerSchema);
