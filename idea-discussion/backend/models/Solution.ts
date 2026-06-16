import mongoose, { Schema } from "mongoose";
import { ISolution } from "../types/index.js";

const solutionSchema = new Schema<ISolution>(
  {
    statement: {
      // 解決策の具体的な手段
      type: String,
      required: true,
    },
    sourceOriginId: {
      // 抽出元の `chat_threads` ID または `imported_items` ID
      type: Schema.Types.ObjectId,
      required: true,
    },
    sourceType: {
      // データソース種別
      type: String,
      required: true,
    },
    originalSnippets: {
      // (任意) 抽出の元になったユーザー発言の断片
      type: [String],
      default: [],
    },
    sourceMetadata: {
      // (任意) ソースに関する追加情報 (例: tweet ID, URL, author)
      type: Object,
      default: {},
    },
    version: {
      // 更新版管理用バージョン番号
      type: Number,
      required: true,
      default: 1,
    },
    themeId: {
      // 追加：所属するテーマのID
      type: Schema.Types.ObjectId,
      ref: "Theme",
      required: true,
    },
    embeddingGenerated: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

const Solution = mongoose.model<ISolution>("Solution", solutionSchema);

export default Solution;
