import SiteConfig from "../models/SiteConfig.js";

export const getSiteConfig = async (req, res) => {
  try {
    let siteConfig = await SiteConfig.findOne();

    if (!siteConfig) {
      siteConfig = await SiteConfig.create({
        title: "XX党 みんなの政策フォーラム",
        aboutMessage:
          "# このサイトについて\n\nこちらは政策フォーラムのサイトです。",
      });
    }

    res.status(200).json(siteConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSiteConfig = async (req, res) => {
  try {
    const { title, aboutMessage } = req.body;

    let siteConfig = await SiteConfig.findOne();

    if (siteConfig) {
      siteConfig.title = title;
      siteConfig.aboutMessage = aboutMessage;
      await siteConfig.save();
    } else {
      siteConfig = await SiteConfig.create({
        title,
        aboutMessage,
      });
    }

    res.status(200).json(siteConfig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
