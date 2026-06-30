import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    aboutMessage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const SiteConfig = mongoose.model("SiteConfig", siteConfigSchema);

export default SiteConfig;
