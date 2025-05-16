import mongoose from "mongoose";

const themeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    slug: {
      // URLなどで使用するための識別子
      type: String,
      required: true,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    customPrompt: {
      type: String,
      required: false,
    },
    starterQuestions: {
      type: [String],
      default: [],
    },
    clusteringResults: {
      type: Map,
      of: Object,
      default: {},
    },
  },
  { timestamps: true }
);

const Theme = mongoose.model("Theme", themeSchema);

export default Theme;
