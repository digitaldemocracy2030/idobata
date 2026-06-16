import mongoose, { Schema } from "mongoose";
import { ISharpQuestion } from "../types/index.js";

const sharpQuestionSchema = new Schema<ISharpQuestion>(
  {
    themeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Theme",
    },
    questionText: {
      type: String,
      required: true,
    },
    tagLine: {
      type: String,
      required: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    sourceProblemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    clusteringResults: {
      type: Map,
      of: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const SharpQuestion = mongoose.model<ISharpQuestion>(
  "SharpQuestion",
  sharpQuestionSchema
);

export default SharpQuestion;
