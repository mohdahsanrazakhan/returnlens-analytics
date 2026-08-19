import {
  CHANNEL_DISTRIBUTION,
  PAYMENT_METHOD_DISTRIBUTION,
  SHIPPING_PARTNER_DISTRIBUTION,
  SHIPPING_PARTNER_RETURN_DAYS,
  CITY_COD_REJECTION_RATE,
  COD_REJECTION_REASON_DISTRIBUTION,
  RETURN_REASON_DISTRIBUTION,
  RETURN_TIMING_DISTRIBUTION,
  ORDER_VALUE_COD_REJECTION,
  DEFAULT_COST_ASSUMPTIONS,
  type Channel,
  type PaymentMethod,
  type ShippingPartner,
  type ReturnReason,
  type CodRejectionReason,
} from "@/lib/constants";
import { weightedPick, randInt, randFloat, bool } from "@/seed/generators/random";
import type { SeedProductSource } from "@/seed/generators/products";

export interface SeedCustomer {
  _id: string;
  customerId: string;
  name: string;
  city: string;
  country: "UAE" | "KSA";
  // Per-customer propensity multipliers so the risk-scoring algorithm (Section 6.3) has enough
  // signal to actually populate all four risk bands — see seed.ts for how tiers are assigned.
  returnMultiplier?: number;
  codMultiplier?: number;
}

export interface SeedProduct extends SeedProductSource {
  _id: string;
}

interface GenerateOrdersOptions {
  rand: () => number;
  customers: SeedCustomer[];
  products: SeedProduct[];
  totalOrders: number;
  months: number; // 12
  now: Date;
}

export interface GeneratedOrder {
  orderId: string;
  channel: Channel;
  customerId: string;
  customerName: string;
  customerCity: string;
  customerCountry: "UAE" | "KSA";
  items: {
    productId: string;
    sku: string;
    nameEn: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  payment: {
    method: PaymentMethod;
    isCOD: boolean;
    currency: "SAR" | "AED";
    subtotal: number;
    shippingCost: number;
    vatAmount: number;
    totalAmount: number;
  };
  shipping: {
    partner: ShippingPartner;
    shippingCost: number;
    deliveredAt: Date | null;
    deliveryAttempts: number;
  };
  status: "delivered" | "returned" | "cod_rejected" | "cancelled";
  return: {
    isReturned: boolean;
    returnDate: Date | null;
    daysAfterDelivery: number | null;
    reason: ReturnReason | null;
    returnShippingCost: number;
    restockingCost: number;
    totalReturnCost: number;
    refundAmount: number;
    refundStatus: "pending" | "processed" | "completed" | null;
  };
  codRejection: {
    isRejected: boolean;
    rejectionDate: Date | null;
    reason: CodRejectionReason | null;
    deliveryAttempts: number;
    wastedShippingCost: number;
    returnToOriginCost: number;
    totalLoss: number;
  };
  createdAt: Date;
}

// Section 10: Month 1 ~350 orders -> Month 12 ~1000 orders (linear growth).
function buildMonthlyWeights(months: number, totalOrders: number): number[] {
  const start = 350;
  const end = 1000;
  const raw = Array.from({ length: months }, (_, i) => start + ((end - start) * i) / (months - 1));
  const rawTotal = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => Math.round((v / rawTotal) * totalOrders));
}

function pickOrderDate(rand: () => number, monthStart: Date): Date {
  const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
  // Fri/Sat (Gulf weekend) get slightly lower order volume weight.
  let day: number;
  for (;;) {
    day = randInt(rand, 1, daysInMonth);
    const dow = new Date(monthStart.getFullYear(), monthStart.getMonth(), day).getDay(); // 0=Sun..6=Sat
    const isWeekend = dow === 5 || dow === 6; // Fri=5, Sat=6
    if (!isWeekend || bool(rand, 0.65)) break; // ~35% chance to reroll weekend days -> lower volume
  }

  // Time-of-day distribution: peak 8PM-12AM (20:00-23:59), reasonable spread otherwise.
  let hour: number;
  const r = rand();
  if (r < 0.4) hour = randInt(rand, 20, 23); // evening peak
  else if (r < 0.65) hour = randInt(rand, 12, 19); // afternoon
  else if (r < 0.85) hour = randInt(rand, 6, 11); // morning
  else hour = randInt(rand, 0, 5); // night

  const minute = randInt(rand, 0, 59);
  return new Date(monthStart.getFullYear(), monthStart.getMonth(), day, hour, minute);
}

function pickProduct(rand: () => number, products: SeedProduct[]): SeedProduct {
  return products[randInt(rand, 0, products.length - 1)];
}

function orderValueBucketRate(amount: number): number {
  const bucket = ORDER_VALUE_COD_REJECTION.find((b) => amount >= b.min && amount < b.max);
  return bucket?.rate ?? 0.12;
}

export function generateOrders({ rand, customers, products, totalOrders, months, now }: GenerateOrdersOptions): GeneratedOrder[] {
  const monthlyWeights = buildMonthlyWeights(months, totalOrders);
  const orders: GeneratedOrder[] = [];
  let orderCounter = 1;

  for (let m = 0; m < months; m++) {
    // Month index 0 = oldest (11 months ago), month `months-1` = current month.
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (months - 1 - m), 1);
    const countThisMonth = monthlyWeights[m];

    for (let i = 0; i < countThisMonth; i++) {
      const createdAt = pickOrderDate(rand, monthDate);
      const customer = customers[randInt(rand, 0, customers.length - 1)];

      const channel = weightedPick(rand, CHANNEL_DISTRIBUTION);

      // Mada is KSA-only; redistribute its share to credit_card for UAE customers.
      let paymentDist = PAYMENT_METHOD_DISTRIBUTION;
      if (customer.country === "UAE") {
        paymentDist = { ...PAYMENT_METHOD_DISTRIBUTION, mada: 0, credit_card: PAYMENT_METHOD_DISTRIBUTION.credit_card + PAYMENT_METHOD_DISTRIBUTION.mada };
      }
      const method = weightedPick(rand, paymentDist);
      const isCOD = method === "cod";

      // 1-3 items, mostly 1
      const itemCount = rand() < 0.7 ? 1 : rand() < 0.85 ? 2 : 3;
      const chosenProducts: SeedProduct[] = [];
      for (let n = 0; n < itemCount; n++) chosenProducts.push(pickProduct(rand, products));

      const items = chosenProducts.map((p) => {
        const quantity = bool(rand, 0.9) ? 1 : 2;
        const unitPrice = p.sellingPrice;
        return {
          productId: p._id,
          sku: p.sku,
          nameEn: p.nameEn,
          quantity,
          unitPrice,
          totalPrice: Math.round(unitPrice * quantity * 100) / 100,
        };
      });

      const subtotal = Math.round(items.reduce((s, it) => s + it.totalPrice, 0) * 100) / 100;
      const currency = customer.country === "UAE" ? "AED" : "SAR";
      const vatRate = customer.country === "UAE" ? DEFAULT_COST_ASSUMPTIONS.vatRateUAE : DEFAULT_COST_ASSUMPTIONS.vatRateKSA;
      const shippingCost = Math.round(randFloat(rand, 12, 28) * 100) / 100;
      const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
      const totalAmount = Math.round((subtotal + shippingCost + vatAmount) * 100) / 100;

      const partner = weightedPick(rand, SHIPPING_PARTNER_DISTRIBUTION);

      const orderId = `ORD-${String(orderCounter).padStart(6, "0")}`;
      orderCounter += 1;

      const base = {
        orderId,
        channel,
        customerId: customer._id,
        customerName: customer.name,
        customerCity: customer.city,
        customerCountry: customer.country,
        items,
        payment: { method, isCOD, currency: currency as "SAR" | "AED", subtotal, shippingCost, vatAmount, totalAmount },
        shipping: { partner, shippingCost, deliveredAt: null as Date | null, deliveryAttempts: 1 },
        createdAt,
      };

      // 1) Cancellations happen before shipping regardless of payment method (6%).
      if (bool(rand, 0.06)) {
        orders.push({
          ...base,
          status: "cancelled",
          return: emptyReturn(),
          codRejection: emptyCodRejection(),
        });
        continue;
      }

      // 2) COD rejection — city rate is the primary driver (Section 6.2, flagged as key data),
      //    modulated by the order-value pattern (higher value = more rejection).
      if (isCOD) {
        const cityRate = CITY_COD_REJECTION_RATE[customer.city] ?? 0.12;
        const valueMultiplier = orderValueBucketRate(totalAmount) / 0.12;
        const rejectionProb = Math.min(0.85, cityRate * valueMultiplier * (customer.codMultiplier ?? 1));

        if (bool(rand, rejectionProb)) {
          const deliveryAttempts = randInt(rand, 1, 3);
          const rejectionDate = new Date(createdAt.getTime() + deliveryAttempts * 24 * 60 * 60 * 1000);
          const reason = weightedPick(rand, COD_REJECTION_REASON_DISTRIBUTION);
          const wastedShippingCost = Math.round(shippingCost * 100) / 100;
          const returnToOriginCost = Math.round(shippingCost * 0.85 * 100) / 100;

          orders.push({
            ...base,
            status: "cod_rejected",
            return: emptyReturn(),
            codRejection: {
              isRejected: true,
              rejectionDate,
              reason,
              deliveryAttempts,
              wastedShippingCost,
              returnToOriginCost,
              totalLoss: Math.round((wastedShippingCost + returnToOriginCost) * 100) / 100,
            },
          });
          continue;
        }
      }

      // 3) Delivered vs returned — driven by the primary item's category-level target rate,
      //    with light modifiers for weekend orders (+5pp) and summer months (heat complaints).
      const primaryProduct = chosenProducts[0];
      const isWeekend = createdAt.getDay() === 5 || createdAt.getDay() === 6;
      const isSummer = [5, 6, 7].includes(createdAt.getMonth()); // Jun-Aug (0-indexed)
      const partnerDamageBoost = partner === "fetchr" ? 1.15 : partner === "dhl" ? 0.85 : 1;

      let returnProb = primaryProduct.returnRateTarget;
      if (isWeekend) returnProb += 0.05;
      if (isSummer) returnProb *= 1.15;
      returnProb *= partnerDamageBoost;
      returnProb *= customer.returnMultiplier ?? 1;
      returnProb = Math.min(0.85, returnProb);

      const deliveryDays = randInt(rand, 1, 3);
      const deliveredAt = new Date(createdAt.getTime() + deliveryDays * 24 * 60 * 60 * 1000);

      if (bool(rand, returnProb)) {
        const timingBucket = weightedPickByShare(rand, RETURN_TIMING_DISTRIBUTION);
        const daysAfterDelivery = randInt(rand, timingBucket.min, timingBucket.max);
        const returnDate = new Date(deliveredAt.getTime() + daysAfterDelivery * 24 * 60 * 60 * 1000);

        let reason = weightedPick(rand, RETURN_REASON_DISTRIBUTION);
        // Category-specific bias toward the reason most associated with that category.
        if ((primaryProduct.category === "Fashion & Apparel" || primaryProduct.category === "Shoes & Footwear") && bool(rand, 0.35)) {
          reason = "wrong_size";
        } else if (partner === "fetchr" && bool(rand, 0.25)) {
          reason = "damaged";
        } else if (primaryProduct.category === "Electronics" && bool(rand, 0.25)) {
          reason = "not_as_described";
        }

        const returnShippingCost = DEFAULT_COST_ASSUMPTIONS.avgReturnShippingCost;
        const restockingCost = DEFAULT_COST_ASSUMPTIONS.avgRestockingCost;
        const refundStatus = rand() < 0.7 ? "completed" : rand() < 0.6 ? "processed" : "pending";

        orders.push({
          ...base,
          shipping: { ...base.shipping, deliveredAt },
          status: "returned",
          return: {
            isReturned: true,
            returnDate,
            daysAfterDelivery,
            reason,
            returnShippingCost,
            restockingCost,
            totalReturnCost: returnShippingCost + restockingCost,
            refundAmount: totalAmount,
            refundStatus,
          },
          codRejection: emptyCodRejection(),
        });
        continue;
      }

      orders.push({
        ...base,
        shipping: { ...base.shipping, deliveredAt },
        status: "delivered",
        return: emptyReturn(),
        codRejection: emptyCodRejection(),
      });
    }
  }

  return orders;
}

function weightedPickByShare<T extends { share: number }>(rand: () => number, list: T[]): T {
  const r = rand();
  let acc = 0;
  for (const item of list) {
    acc += item.share;
    if (r <= acc) return item;
  }
  return list[list.length - 1];
}

function emptyReturn() {
  return {
    isReturned: false,
    returnDate: null,
    daysAfterDelivery: null,
    reason: null,
    returnShippingCost: 0,
    restockingCost: 0,
    totalReturnCost: 0,
    refundAmount: 0,
    refundStatus: null,
  };
}

function emptyCodRejection() {
  return {
    isRejected: false,
    rejectionDate: null,
    reason: null,
    deliveryAttempts: 0,
    wastedShippingCost: 0,
    returnToOriginCost: 0,
    totalLoss: 0,
  };
}

export { SHIPPING_PARTNER_RETURN_DAYS };
