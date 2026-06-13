import express from "express";
import PcosAssessment from "../models/PcosAssessment.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId, formData, result } = req.body;

    if (!userId || !formData || !result) {
      return res.status(400).json({
        success: false,
        message: "userId, formData, and result are required",
      });
    }

    const assessment = await PcosAssessment.create({
      userId,
      formData,
      result,
    });

    res.status(201).json({
      success: true,
      message: "PCOS assessment saved successfully",
      data: assessment,
    });
  } catch (error) {
    console.error("SAVE PCOS ASSESSMENT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save PCOS assessment",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const assessments = await PcosAssessment.find({
      userId: req.params.userId,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: assessments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessments",
    });
  }
});

export default router;