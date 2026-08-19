import type {
  Channel,
  Country,
  Currency,
  PaymentMethod,
  ReturnReason,
  CodRejectionReason,
  ShippingPartner,
  OrderStatus,
  RiskLevel,
  ProductRiskLevel,
} from "@/lib/constants";

export interface ProductLite {
  _id: string;
  sku: string;
  nameEn: string;
  nameAr: string;
  category: string;
  subcategory: string;
  brand: string;
  sellingPrice: number;
  returnStats: {
    totalSold: number;
    totalReturned: number;
    returnRate: number;
    returnCost: number;
    topReturnReason: ReturnReason | null;
    avgDaysToReturn: number;
    returnsByReason: Record<ReturnReason, number>;
  };
  codStats: { totalCODOrders: number; codRejections: number; codRejectionRate: number };
  riskLevel: ProductRiskLevel;
}

export interface CustomerLite {
  _id: string;
  customerId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: Country;
  stats: {
    totalOrders: number;
    totalSpent: number;
    totalReturns: number;
    returnRate: number;
    totalCODOrders: number;
    codRejections: number;
    codRejectionRate: number;
    avgOrderValue: number;
    firstOrderDate: string | null;
    lastOrderDate: string | null;
    daysSinceLastOrder: number;
  };
  riskScore: number;
  riskLevel: RiskLevel;
  riskFactors: string[];
}

export interface OrderLite {
  _id: string;
  orderId: string;
  channel: Channel;
  customerName: string;
  customerCity: string;
  customerCountry: Country;
  payment: {
    method: PaymentMethod;
    isCOD: boolean;
    currency: Currency;
    totalAmount: number;
  };
  status: OrderStatus;
  return?: { reason: ReturnReason | null; isReturned: boolean };
  codRejection?: { reason: CodRejectionReason | null; isRejected: boolean };
  createdAt: string;
}

export interface DashboardResponse {
  totalLoss: { returns: number; cod: number; total: number; potentialSavings: number };
  kpis: {
    returnRate: { current: number; previous: number; change: number; sparkline: number[] };
    codSuccessRate: { current: number; previous: number; change: number; sparkline: number[] };
    avgDaysToReturn: { current: number; previous: number; change: number };
    costPerReturn: { current: number; previous: number; change: number };
  };
  returnTrend: { month: string; returnRate: number; codRejectionRate: number }[];
  lossByCity: { city: string; returnLoss: number; codLoss: number; total: number }[];
  topReturnedProducts: { product: ProductLite; returnRate: number; unitsReturned: number; totalLoss: number }[];
  quickInsights: { severity: "critical" | "warning" | "good"; text: string; link: string }[];
  returnsCostOrders: number;
  codLossOrders: number;
}

export interface ReturnsResponse {
  overview: { totalReturns: number; returnCost: number; avgProcessingDays: number; avgRefundDays: number };
  trend: { date: string; rate: number; count: number; cost: number }[];
  byReason: { reason: ReturnReason; count: number; percentage: number }[];
  byCategory: { category: string; returnRate: number; count: number; loss: number }[];
  byCity: { city: string; returnRate: number; count: number }[];
  byChannel: { channel: Channel; returnRate: number; codRejectionRate: number; count: number }[];
  timeline: { daysAfterDelivery: string; percentage: number; count: number }[];
  byDeliveryPartner: {
    partner: ShippingPartner;
    damageRate: number;
    avgProcessingDays: number;
    totalReturns: number;
    deliveriesHandled: number;
  }[];
  reasonTrend: { month: string; [reason: string]: number | string }[];
}

export interface CodResponse {
  overview: {
    codOrders: number;
    codPercentage: number;
    revenueCollected: number;
    rejections: number;
    rejectionRate: number;
    totalLoss: number;
  };
  vsPrepaid: {
    cod: { orders: number; successRate: number; returnRate: number; avgAOV: number; lossPerOrder: number };
    prepaid: { orders: number; successRate: number; returnRate: number; avgAOV: number; lossPerOrder: number };
  };
  byCity: { city: string; successRate: number; rejections: number; loss: number }[];
  byOrderValue: { range: string; rejectionRate: number; count: number; loss: number }[];
  byReason: { reason: CodRejectionReason; count: number; percentage: number }[];
  byDayOfWeek: { day: string; rejectionRate: number }[];
  byTimeOfDay: { slot: string; rejectionRate: number }[];
  recovery: { reattempted: number; converted: number; unrecoverable: number };
}

export interface ProductsResponse {
  categoryHeatmap: { category: string; returnRate: number; codRejectionRate: number; totalLoss: number }[];
  products: ProductLite[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CustomersResponse {
  distribution: { low: number; medium: number; high: number; critical: number };
  customers: CustomerLite[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface RecommendationLite {
  _id: string;
  type: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  problem: string;
  impact: string;
  recommendation: string;
  estimatedSavings: number;
  estimatedSavingsPercent: number;
  implementationSteps: string[];
  implementationDifficulty: "easy" | "medium" | "hard";
  timeToImplement: string;
  dataPoints: { metric: string; currentValue: string; benchmarkValue: string; gap: string }[];
  status: "new" | "viewed" | "implementing" | "implemented" | "dismissed";
  isAIGenerated: boolean;
}
