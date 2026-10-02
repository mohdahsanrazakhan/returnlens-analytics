import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import UserModel from "@/models/User";
import CustomerModel from "@/models/Customer";
import ProductModel from "@/models/Product";
import OrderModel from "@/models/Order";
import RecommendationModel from "@/models/Recommendation";
import { mulberry32, weightedPick } from "@/seed/generators/random";
import { randomCustomerName, randomPhone } from "@/seed/generators/customers";
import { loadProductSources } from "@/seed/generators/products";
import { generateOrders, type SeedCustomer, type SeedProduct } from "@/seed/generators/orders";
import { SEED_RECOMMENDATIONS } from "@/seed/data/recommendations";
import citiesData from "@/seed/data/cities.json";
import { VOLUME, RETURN_REASONS, RISK_DISTRIBUTION, type ReturnReason } from "@/lib/constants";
import { calculateRiskScore, getRiskLevel, buildRiskFactors } from "@/lib/risk-calculator";

// Propensity multipliers per persona tier, applied on top of the product/city-driven base
// probabilities during order generation. Without this, per-customer return/COD rates cluster
// too tightly around the population average for the risk algorithm (Section 6.3) to ever
// populate the "critical" band — real serial-returner behavior is a customer-level trait, not
// pure chance, so we bake in a persona per customer (assigned in the target 55/25/14/6 split).
const TIER_MULTIPLIERS: Record<string, { returnMultiplier: number; codMultiplier: number }> = {
  low: { returnMultiplier: 0.45, codMultiplier: 0.45 },
  medium: { returnMultiplier: 1.1, codMultiplier: 1.1 },
  high: { returnMultiplier: 2.6, codMultiplier: 2.3 },
  critical: { returnMultiplier: 6.5, codMultiplier: 5.5 },
};

function log(msg: string) {
  // eslint-disable-next-line no-console
  console.log(`[seed] ${msg}`);
}

export async function runSeed() {
  const rand = mulberry32(20260816);
  await connectDB();
  log("Connected to MongoDB");

  await Promise.all([
    UserModel.deleteMany({}),
    CustomerModel.deleteMany({}),
    ProductModel.deleteMany({}),
    OrderModel.deleteMany({}),
    RecommendationModel.deleteMany({}),
  ]);
  log("Dropped existing collections");

  // ---- 1. Demo user ----
  const passwordHash = await bcrypt.hash("ReturnLens@2026", 12);
  await UserModel.create({
    name: "Demo User",
    email: "demo@returnlens.com",
    passwordHash,
    company: "Gulf Electronics Trading LLC",
    role: "admin",
  });
  log("Created demo user (demo@returnlens.com)");

  // ---- 2. Products (65, from src/seed/data/products.json) ----
  const productSources = loadProductSources();
  const productDocs = await ProductModel.insertMany(
    productSources.map((p) => ({
      sku: p.sku,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      sellingPrice: p.sellingPrice,
      weight: p.weight,
      returnStats: {
        totalSold: 0,
        totalReturned: 0,
        returnRate: 0,
        returnCost: 0,
        topReturnReason: null,
        avgDaysToReturn: 0,
        returnsByReason: { wrong_size: 0, damaged: 0, not_as_described: 0, changed_mind: 0, defective: 0, wrong_item: 0 },
      },
      codStats: { totalCODOrders: 0, codRejections: 0, codRejectionRate: 0 },
      riskLevel: "low",
    }))
  );
  const products: SeedProduct[] = productDocs.map((doc, i) => ({
    ...productSources[i],
    _id: doc._id.toString(),
  }));
  log(`Created ${products.length} products`);

  // ---- 3. Customers (800, geographic distribution per Section 6.2) ----
  const geoPool: { city: string; country: "UAE" | "KSA" }[] = [];
  for (const [country, cities] of Object.entries(citiesData) as ["UAE" | "KSA", { city: string; share: number }[]][]) {
    for (const c of cities) {
      const n = Math.round(c.share * VOLUME.customers);
      for (let i = 0; i < n; i++) geoPool.push({ city: c.city, country });
    }
  }
  while (geoPool.length < VOLUME.customers) geoPool.push(geoPool[geoPool.length % geoPool.length]);
  geoPool.length = VOLUME.customers;

  const customerDocs = await CustomerModel.insertMany(
    geoPool.map((g, i) => {
      const customerId = `CUST-${String(i + 1).padStart(5, "0")}`;
      const name = randomCustomerName(rand);
      const email = `${name.toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, ".")}${i}@example.com`;
      return {
        customerId,
        name,
        email,
        phone: randomPhone(g.country, rand),
        city: g.city,
        country: g.country,
        stats: {},
        riskScore: 0,
        riskLevel: "low",
        riskFactors: [],
      };
    })
  );
  // Assign a persona tier per customer (55/25/14/6, matching Section 6.3's target risk
  // distribution) that biases their personal return/COD-rejection propensity during generation.
  const tierByCustomer = new Map<string, string>();
  const customers: SeedCustomer[] = customerDocs.map((doc) => {
    const tier = weightedPick(rand, RISK_DISTRIBUTION);
    tierByCustomer.set(doc._id.toString(), tier);
    const mult = TIER_MULTIPLIERS[tier];
    return {
      _id: doc._id.toString(),
      customerId: doc.customerId,
      name: doc.name,
      city: doc.city,
      country: doc.country as "UAE" | "KSA",
      returnMultiplier: mult.returnMultiplier,
      codMultiplier: mult.codMultiplier,
    };
  });
  log(`Created ${customers.length} customers`);

  // ---- 4. Orders (8,000 over 12 months, following Section 6.2 distributions) ----
  const now = new Date();
  const generated = generateOrders({ rand, customers, products, totalOrders: VOLUME.orders, months: 12, now });

  // For critical-tier customers only, nudge 1-2 of their returns into the last 30 days so the
  // risk algorithm's "recentReturnCount" component (Section 6.3) can fire — real serial-returner
  // flags usually come from a recent burst, not a diffuse rate. Kept to the critical tier only,
  // capped at 2 orders/customer, and spread randomly across the full 30-day window (rather than
  // a few fixed days) so this doesn't create an artificial spike in the dashboard's 7d/30d KPIs.
  const ordersByCustomerForClustering = new Map<string, typeof generated>();
  for (const o of generated) {
    const list = ordersByCustomerForClustering.get(o.customerId) ?? [];
    list.push(o);
    ordersByCustomerForClustering.set(o.customerId, list);
  }
  for (const [customerId, tier] of tierByCustomer) {
    if (tier !== "critical") continue;
    const custOrders = (ordersByCustomerForClustering.get(customerId) ?? []).filter((o) => o.status === "returned");
    if (custOrders.length === 0) continue;
    const clusterSize = Math.min(2, custOrders.length);
    custOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const usedDays = new Set<number>();
    for (let i = 0; i < clusterSize; i++) {
      const order = custOrders[i];
      let daysAgo = 2 + Math.floor(rand() * 28);
      while (usedDays.has(daysAgo)) daysAgo = 2 + Math.floor(rand() * 28);
      usedDays.add(daysAgo);
      const newCreatedAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const deliveryDays = order.shipping.deliveredAt
        ? (order.shipping.deliveredAt.getTime() - order.createdAt.getTime()) / (24 * 60 * 60 * 1000)
        : 2;
      const newDeliveredAt = new Date(newCreatedAt.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
      const daysAfterDelivery = order.return.daysAfterDelivery ?? 2;
      order.createdAt = newCreatedAt;
      order.shipping.deliveredAt = newDeliveredAt;
      order.return.returnDate = new Date(newDeliveredAt.getTime() + daysAfterDelivery * 24 * 60 * 60 * 1000);
    }
  }

  await OrderModel.insertMany(generated, { ordered: false });
  log(`Created ${generated.length} orders`);

  // ---- 5. Recompute customer aggregated stats + risk scores ----
  const ordersByCustomer = new Map<string, typeof generated>();
  for (const o of generated) {
    const list = ordersByCustomer.get(o.customerId) ?? [];
    list.push(o);
    ordersByCustomer.set(o.customerId, list);
  }

  const customerBulkOps = [];
  for (const doc of customerDocs) {
    const custOrders = ordersByCustomer.get(doc._id.toString()) ?? [];
    const nonCancelled = custOrders.filter((o) => o.status !== "cancelled");
    const totalOrders = custOrders.length;
    const totalSpent = custOrders.reduce((s, o) => s + o.payment.totalAmount, 0);
    const returns = custOrders.filter((o) => o.status === "returned");
    const codOrders = custOrders.filter((o) => o.payment.isCOD);
    const codRejections = custOrders.filter((o) => o.status === "cod_rejected");

    const returnRate = nonCancelled.length ? (returns.length / nonCancelled.length) * 100 : 0;
    const codRejectionRate = codOrders.length ? (codRejections.length / codOrders.length) * 100 : 0;
    const avgOrderValue = totalOrders ? totalSpent / totalOrders : 0;

    const dates = custOrders.map((o) => o.createdAt).sort((a, b) => a.getTime() - b.getTime());
    const firstOrderDate = dates[0] ?? null;
    const lastOrderDate = dates[dates.length - 1] ?? null;
    const daysSinceLastOrder = lastOrderDate ? Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const accountAge = firstOrderDate ? Math.floor((now.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;

    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentReturnCount = returns.filter((o) => o.createdAt >= thirtyDaysAgo).length;

    const riskInput = {
      returnRate,
      codRejectionRate,
      totalOrders,
      recentReturnCount,
      avgOrderValue,
      daysSinceLastOrder,
      accountAge,
    };
    const riskScore = calculateRiskScore(riskInput);
    const riskLevel = getRiskLevel(riskScore);
    const riskFactors = buildRiskFactors(riskInput);

    customerBulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            stats: {
              totalOrders,
              totalSpent: Math.round(totalSpent * 100) / 100,
              totalReturns: returns.length,
              returnRate: Math.round(returnRate * 10) / 10,
              totalCODOrders: codOrders.length,
              codRejections: codRejections.length,
              codRejectionRate: Math.round(codRejectionRate * 10) / 10,
              avgOrderValue: Math.round(avgOrderValue * 100) / 100,
              firstOrderDate,
              lastOrderDate,
              daysSinceLastOrder,
            },
            riskScore,
            riskLevel,
            riskFactors,
          },
        },
      },
    });
  }
  await CustomerModel.bulkWrite(customerBulkOps);
  log("Recomputed customer stats + risk scores");

  // ---- 6. Recompute product return/COD stats ----
  const ordersByProduct = new Map<string, typeof generated>();
  for (const o of generated) {
    const productIds = new Set(o.items.map((it) => it.productId));
    for (const pid of productIds) {
      const list = ordersByProduct.get(pid) ?? [];
      list.push(o);
      ordersByProduct.set(pid, list);
    }
  }

  const productBulkOps = [];
  for (const doc of productDocs) {
    const pOrders = ordersByProduct.get(doc._id.toString()) ?? [];
    const nonCancelled = pOrders.filter((o) => o.status !== "cancelled");
    const totalSold = nonCancelled.reduce(
      (sum, o) => sum + o.items.filter((it) => it.productId === doc._id.toString()).reduce((s, it) => s + it.quantity, 0),
      0
    );
    const returned = pOrders.filter((o) => o.status === "returned");
    const returnRate = nonCancelled.length ? (returned.length / nonCancelled.length) * 100 : 0;
    const returnCost = returned.reduce((s, o) => s + o.return.totalReturnCost, 0);
    const avgDaysToReturn = returned.length
      ? returned.reduce((s, o) => s + (o.return.daysAfterDelivery ?? 0), 0) / returned.length
      : 0;

    const returnsByReason: Record<ReturnReason, number> = {
      wrong_size: 0,
      damaged: 0,
      not_as_described: 0,
      changed_mind: 0,
      defective: 0,
      wrong_item: 0,
    };
    for (const o of returned) {
      if (o.return.reason) returnsByReason[o.return.reason] += 1;
    }
    let topReturnReason: ReturnReason | null = null;
    let topCount = 0;
    for (const reason of RETURN_REASONS) {
      if (returnsByReason[reason] > topCount) {
        topCount = returnsByReason[reason];
        topReturnReason = reason;
      }
    }

    const codOrders = pOrders.filter((o) => o.payment.isCOD);
    const codRejections = pOrders.filter((o) => o.status === "cod_rejected");
    const codRejectionRate = codOrders.length ? (codRejections.length / codOrders.length) * 100 : 0;

    const riskLevel = returnRate > 20 ? "high" : returnRate > 10 ? "medium" : "low";

    productBulkOps.push({
      updateOne: {
        filter: { _id: doc._id },
        update: {
          $set: {
            "returnStats.totalSold": totalSold,
            "returnStats.totalReturned": returned.length,
            "returnStats.returnRate": Math.round(returnRate * 10) / 10,
            "returnStats.returnCost": Math.round(returnCost * 100) / 100,
            "returnStats.topReturnReason": topReturnReason,
            "returnStats.avgDaysToReturn": Math.round(avgDaysToReturn * 10) / 10,
            "returnStats.returnsByReason": returnsByReason,
            "codStats.totalCODOrders": codOrders.length,
            "codStats.codRejections": codRejections.length,
            "codStats.codRejectionRate": Math.round(codRejectionRate * 10) / 10,
            riskLevel,
          },
        },
      },
    });
  }
  await ProductModel.bulkWrite(productBulkOps);
  log("Recomputed product return/COD stats");

  // ---- 7. Recommendations (20 pre-written) ----
  await RecommendationModel.insertMany(
    SEED_RECOMMENDATIONS.map((r) => ({ ...r, status: "new", isAIGenerated: false }))
  );
  log(`Created ${SEED_RECOMMENDATIONS.length} recommendations`);

  const statusCounts = generated.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  log(`Order status breakdown: ${JSON.stringify(statusCounts)}`);

  log("Seed complete ✅");
}
