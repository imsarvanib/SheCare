import mongoose from "mongoose";

const pcosAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },

    formData: {
      type: Object,
      required: true,
    },

    result: {
      possibilityLevel: String,
      toughnessLevel: String,
      score: Number,
      bmi: Number,
      bmiCategory: String,
      mainRiskFactors: [String],
      dietPlan: [String],
      lifestylePlan: [String],
      doctorRecommendation: [String],
      disclaimer: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("PcosAssessment", pcosAssessmentSchema);