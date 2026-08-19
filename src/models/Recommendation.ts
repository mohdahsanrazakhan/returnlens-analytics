import { Schema, model, models, type InferSchemaType } from "mongoose";
import {
  RECOMMENDATION_TYPES,
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_STATUSES,
  RECOMMENDATION_DIFFICULTY,
} from "@/lib/constants";

const DataPointSchema = new Schema(
  {
    metric: { type: String, required: true },
    currentValue: { type: String, required: true },
    benchmarkValue: { type: String, required: true },
    gap: { type: String, required: true },
  },
  { _id: false }
);

const RecommendationSchema = new Schema(
  {
    type: { type: String, enum: RECOMMENDATION_TYPES, required: true, index: true },
    priority: { type: String, enum: RECOMMENDATION_PRIORITIES, required: true, index: true },

    title: { type: String, required: true, maxlength: 200 },
    problem: { type: String, required: true },
    impact: { type: String, required: true },
    recommendation: { type: String, required: true },
    estimatedSavings: { type: Number, required: true, min: 0 },
    estimatedSavingsPercent: { type: Number, required: true, min: 0, max: 100 },

    implementationSteps: { type: [String], default: [] },
    implementationDifficulty: { type: String, enum: RECOMMENDATION_DIFFICULTY, required: true },
    timeToImplement: { type: String, required: true },

    dataPoints: { type: [DataPointSchema], default: [] },

    status: { type: String, enum: RECOMMENDATION_STATUSES, default: "new", index: true },
    isAIGenerated: { type: Boolean, default: false },
  },
  { timestamps: true, strict: true }
);

export type RecommendationDoc = InferSchemaType<typeof RecommendationSchema>;

export default models.Recommendation || model("Recommendation", RecommendationSchema);
