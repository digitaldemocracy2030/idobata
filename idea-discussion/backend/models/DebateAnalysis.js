import mongoose from "mongoose";

const debateAnalysisSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SharpQuestion",
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    axes: [
      {
        title: String,
        options: [
          {
            label: String,
            description: String,
          },
        ],
      },
    ],
    agreementPoints: [String],
    disagreementPoints: [String],
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

debateAnalysisSchema.index({ questionId: 1, version: 1 }, { unique: true });

const DebateAnalysis = mongoose.model("DebateAnalysis", debateAnalysisSchema);

export default DebateAnalysis;
