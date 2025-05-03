import mongoose from "mongoose";

const questionVisualReportSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharpQuestion",
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    overallAnalysis: {
      type: String,
      required: true,
    },
    sourceProblemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    sourceSolutionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Solution",
      },
    ],
    version: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
); // createdAt, updatedAt を自動追加

questionVisualReportSchema.index({ questionId: 1 }, { unique: true });

const QuestionVisualReport = mongoose.model(
  "QuestionVisualReport",
  questionVisualReportSchema
);

export default QuestionVisualReport;
