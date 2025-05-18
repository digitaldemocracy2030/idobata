import { FactCheckAnalysis } from "./types.js";

export function formatFactCheckResult(analysis: FactCheckAnalysis): string {
  const timestamp = new Date().toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });

  let markdown = `# 🔍 ファクトチェック結果\n\n`;
  markdown += `**実施日時**: ${timestamp} JST\n\n`;

  markdown += `## 📋 概要\n\n${analysis.summary}\n\n`;

  markdown += `## 📊 詳細分析\n\n`;

  analysis.details.forEach((detail, index) => {
    markdown += `### ${index + 1}. ${detail.topic}\n\n`;
    markdown += `> ${detail.claim}\n\n`;
    markdown += `**✓ 事実確認**: ${detail.isFactual ? "正確です" : "**不正確** です"}。${detail.correction}\n\n`;

    if (detail.sources && detail.sources.length > 0) {
      markdown += `**参考**:\n`;
      detail.sources.forEach((source) => {
        markdown += `- [${source.title}](${source.url})\n`;
      });
      markdown += `\n`;
    }
  });

  markdown += `## 🏁 結論\n\n${analysis.conclusion}\n`;

  return markdown;
}
