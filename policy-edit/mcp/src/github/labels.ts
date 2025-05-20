import type { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import config from "../config.js";
import logger from "../logger.js";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: config.OPENROUTER_API_KEY,
});

export interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  description: string | null;
  color: string;
  default: boolean;
}

/**
 * リポジトリの全ラベルを取得する
 * @param octokit 認証済みOctokitインスタンス
 * @returns ラベルの配列
 */
export async function fetchRepoLabels(
  octokit: Octokit
): Promise<GitHubLabel[]> {
  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;

  logger.info(`Fetching labels for ${owner}/${repo}`);

  try {
    const { data: labels } = await octokit.rest.issues.listLabelsForRepo({
      owner,
      repo,
      per_page: 100, // 一度に取得するラベル数（最大100）
    });

    logger.info(`Fetched ${labels.length} labels from repository`);
    return labels;
  } catch (error) {
    logger.error({ error }, "Failed to fetch repository labels");
    throw error;
  }
}

/**
 * LLMを使用してPRの内容に基づいて適切なラベルを選択する
 * @param prTitle PRのタイトル
 * @param prBody PRの説明文
 * @param labels 利用可能なラベルのリスト
 * @returns 適用すべきラベル名の配列
 */
export async function selectLabelsWithLLM(
  prTitle: string,
  prBody: string,
  labels: GitHubLabel[]
): Promise<string[]> {
  const availableLabels = labels.map((label) => ({
    name: label.name,
    description: label.description || `Label: ${label.name}`,
  }));

  const prompt = `
あなたはGitHubプルリクエスト（PR）に適切なラベルを付ける専門家です。
以下のPRの内容を分析し、最も適切なラベルを選択してください。

## PR情報
タイトル: ${prTitle}
説明: ${prBody}

## 利用可能なラベル
${JSON.stringify(availableLabels, null, 2)}

## 指示
1. PRの内容を分析してください
2. 利用可能なラベルの中から、このPRに最も適切なラベルを選択してください
3. 選択したラベル名のみを配列形式で返してください（例: ["bug", "documentation"]）
4. 適切なラベルがない場合は空の配列を返してください
5. 回答は必ずJSON形式の配列のみを返してください

## 回答形式
["label1", "label2", ...]
`;

  try {
    logger.info("Requesting LLM to select labels for PR");

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-preview-03-25", // 使用するモデル
      messages: [
        {
          role: "system",
          content:
            "あなたはGitHubプルリクエストに適切なラベルを付ける専門家です。回答は必ずJSON形式の配列のみを返してください。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      logger.warn("LLM returned empty content");
      return [];
    }

    try {
      const parsedContent = JSON.parse(content);

      const selectedLabels = Array.isArray(parsedContent.labels)
        ? parsedContent.labels
        : Array.isArray(parsedContent)
          ? parsedContent
          : [];

      const validLabels = selectedLabels.filter((label: string) =>
        labels.some((l) => l.name === label)
      );

      logger.info(
        `LLM selected labels for PR: ${validLabels.join(", ") || "none"}`
      );
      return validLabels;
    } catch (parseError) {
      logger.error({ error: parseError }, "Failed to parse LLM response");

      const labelMatches = content.match(/"([^"]+)"/g);
      if (labelMatches) {
        const extractedLabels = labelMatches
          .map((match) => match.replace(/"/g, ""))
          .filter((label) => labels.some((l) => l.name === label));

        logger.info(
          `Extracted labels from unparseable response: ${
            extractedLabels.join(", ") || "none"
          }`
        );
        return extractedLabels;
      }

      return [];
    }
  } catch (error) {
    logger.error({ error }, "Error calling LLM for label selection");
    return [];
  }
}

/**
 * PRにラベルを適用する
 * @param octokit 認証済みOctokitインスタンス
 * @param prNumber PR番号
 * @param labels 適用するラベル名の配列
 */
export async function applyLabelsToPR(
  octokit: Octokit,
  prNumber: number,
  labels: string[]
): Promise<void> {
  if (labels.length === 0) {
    logger.info(`No labels to apply to PR #${prNumber}`);
    return;
  }

  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;

  logger.info(`Applying labels to PR #${prNumber}: ${labels.join(", ")}`);

  try {
    await octokit.rest.issues.addLabels({
      owner,
      repo,
      issue_number: prNumber,
      labels,
    });
    logger.info(`Successfully applied labels to PR #${prNumber}`);
  } catch (error) {
    logger.error({ error }, `Failed to apply labels to PR #${prNumber}`);
    throw error;
  }
}
