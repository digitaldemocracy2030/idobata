import mongoose from "mongoose";

const sharpQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      // "How might we..." 形式の問い
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
        // (任意) この問いの生成に使用された `problems` のIDリスト
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
    themeId: {
      // 追加：所属するテーマのID
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theme",
      required: true,
    },
    clusteringResults: {
      type: Map,
      of: Object,
      default: {},
    },
  },
  { timestamps: true }
); // createdAt, updatedAt を自動追加 (todo.md指示)

const SharpQuestion = mongoose.model("SharpQuestion", sharpQuestionSchema);

export default SharpQuestion;
