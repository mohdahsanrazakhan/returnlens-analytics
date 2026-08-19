import { Schema, model, models, type InferSchemaType } from "mongoose";
import {
  CHANNELS,
  PAYMENT_METHODS,
  SHIPPING_PARTNERS,
  ORDER_STATUSES,
  RETURN_REASONS,
  COD_REJECTION_REASONS,
  COUNTRIES,
  CURRENCIES,
} from "@/lib/constants";

const ItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    nameEn: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    method: { type: String, enum: PAYMENT_METHODS, required: true, index: true },
    isCOD: { type: Boolean, required: true, index: true },
    currency: { type: String, enum: CURRENCIES, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, required: true, min: 0 },
    vatAmount: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingSchema = new Schema(
  {
    partner: { type: String, enum: SHIPPING_PARTNERS, required: true, index: true },
    shippingCost: { type: Number, required: true, min: 0 },
    deliveredAt: { type: Date, default: null },
    deliveryAttempts: { type: Number, default: 1, min: 0 },
  },
  { _id: false }
);

const ReturnSchema = new Schema(
  {
    isReturned: { type: Boolean, default: false, index: true },
    returnDate: { type: Date, default: null },
    daysAfterDelivery: { type: Number, default: null },
    reason: { type: String, enum: [...RETURN_REASONS, null], default: null },
    returnShippingCost: { type: Number, default: 0 },
    restockingCost: { type: Number, default: 0 },
    totalReturnCost: { type: Number, default: 0 },
    refundAmount: { type: Number, default: 0 },
    refundStatus: { type: String, enum: ["pending", "processed", "completed", null], default: null },
  },
  { _id: false }
);

const CodRejectionSchema = new Schema(
  {
    isRejected: { type: Boolean, default: false, index: true },
    rejectionDate: { type: Date, default: null },
    reason: { type: String, enum: [...COD_REJECTION_REASONS, null], default: null },
    deliveryAttempts: { type: Number, default: 0 },
    wastedShippingCost: { type: Number, default: 0 },
    returnToOriginCost: { type: Number, default: 0 },
    totalLoss: { type: Number, default: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    channel: { type: String, enum: CHANNELS, required: true, index: true },

    customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    customerName: { type: String, required: true },
    customerCity: { type: String, required: true, index: true },
    customerCountry: { type: String, enum: COUNTRIES, required: true, index: true },

    items: { type: [ItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },

    payment: { type: PaymentSchema, required: true },
    shipping: { type: ShippingSchema, required: true },

    status: { type: String, enum: ORDER_STATUSES, required: true, index: true },

    return: { type: ReturnSchema, default: () => ({}) },
    codRejection: { type: CodRejectionSchema, default: () => ({}) },

    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, strict: true }
);

OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ "payment.isCOD": 1, status: 1 });
OrderSchema.index({ customerCity: 1, status: 1 });

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

export default models.Order || model("Order", OrderSchema);
