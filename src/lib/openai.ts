import OpenAI from "openai";
import { sanitizeAiInput } from "@/lib/validators";

// Server-side only client (Section 3.5) — never import this file from a "use client" component.
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export interface GeneratedRecommendation {
  title: string;
  problem: string;
  impact: string;
  recommendation: string;
  implementationSteps: string[];
  difficulty: "easy" | "medium" | "hard";
  timeToImplement: string;
}

export interface DataSummary {
  overallReturnRate: number;
  codRejectionRate: number;
  topReturnReasons: string[];
  worstCodCity: { city: string; rate: number };
  worstCategory: { category: string; rate: number };
  totalMonthlyLoss: number;
}

export async function generateRecommendations(summary: DataSummary): Promise<GeneratedRecommendation[]> {
  const openai = getClient();

  const prompt = sanitizeAiInput(
    `Analyze this e-commerce data and generate actionable recommendations:
- Overall return rate: ${summary.overallReturnRate}%
- COD rejection rate: ${summary.codRejectionRate}%
- Top return reasons: ${summary.topReturnReasons.join(", ")}
- Worst performing city for COD: ${summary.worstCodCity.city} at ${summary.worstCodCity.rate}%
- Worst performing category: ${summary.worstCategory.category} at ${summary.worstCategory.rate}% return rate
- Total monthly loss: SAR ${summary.totalMonthlyLoss}`
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 1500,
    temperature: 0.7,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an e-commerce operations analyst for Gulf region sellers. Generate 2-3 specific, data-backed recommendations in JSON format under a `recommendations` array. Each item must include: title, problem, impact (SAR savings), recommendation, implementationSteps (array), difficulty (easy/medium/hard), timeToImplement. Focus on quick wins the seller can implement this week.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content ?? "{}";
  let parsed: { recommendations?: GeneratedRecommendation[] };
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = { recommendations: [] };
  }

  return parsed.recommendations ?? [];
}
