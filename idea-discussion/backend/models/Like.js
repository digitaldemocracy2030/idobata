import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ["question"], // Currently only supporting 'question', but can be extended in the future
    },
  },
  { timestamps: true }
);

likeSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;
