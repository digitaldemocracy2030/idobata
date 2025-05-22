import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Octokit } from "@octokit/rest";
import { OpenAI } from "openai";
import { z } from "zod";
import config from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import logger from "../logger.js";

export const determineTargetFileSchema = z.object({
  query: z.string().min(1),
  currentFilePath: z.string(),
});

export type DetermineTargetFileInput = z.infer<
  typeof determineTargetFileSchema
>;

interface FileRule {
  keywords: string[];
  filePath: string;
}

export async function handleDetermineTargetFile(
  params: DetermineTargetFileInput
): Promise<CallToolResult> {
  const { query, currentFilePath } = params;

  try {
    const octokit = await getAuthenticatedOctokit();
    const owner = config.GITHUB_TARGET_OWNER;
    const repo = config.GITHUB_TARGET_REPO;
    const baseBranch = config.GITHUB_BASE_BRANCH;
    const rulesFilePath = ".meta/target_file_rules.txt";

    let rules: FileRule[] = [];
    let rulesSource = "filename"; // デフォルトはファイル名のみから判定

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: rulesFilePath,
        ref: baseBranch,
      });

      if (!Array.isArray(data) && data.type === "file" && data.content) {
        const rulesContent = Buffer.from(data.content, "base64").toString(
          "utf-8"
        );
        rules = parseRulesFile(rulesContent);
        rulesSource = "rules";
        logger.info(`Successfully loaded rules from ${rulesFilePath}`);
      }
    } catch (error) {
      logger.warn(
        `Rules file not found at ${rulesFilePath}, will use filename-based selection`
      );
    }

    const existingFiles = await getRepositoryFiles(
      octokit,
      owner,
      repo,
      baseBranch
    );

    let result: { targetFilePath: string; reason: string };
    if (rulesSource === "rules" && rules.length > 0) {
      result = await callLLMForFileSelection(
        query,
        rules,
        existingFiles,
        currentFilePath
      );
    } else {
      result = await selectFileByName(query, existingFiles, currentFilePath);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            targetFilePath: result.targetFilePath,
            reason: result.reason,
          }),
        },
      ],
    };
  } catch (error) {
    logger.error("Error determining target file:", error);

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error determining target file: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
}

function parseRulesFile(content: string): FileRule[] {
  const rules: FileRule[] = [];
  const lines = content.split("\n");

  for (const line of lines) {
    if (line.trim().startsWith("#") || line.trim() === "") continue;

    const match = line.match(/^(.*?):\s*(.*)$/);
    if (match) {
      const keywords = match[1].split(",").map((k) => k.trim());
      const filePath = match[2].trim();
      rules.push({ keywords, filePath });
    }
  }

  return rules;
}

async function getRepositoryFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  baseBranch: string
): Promise<string[]> {
  async function getFilesRecursively(path = ""): Promise<string[]> {
    const { data } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
      ref: baseBranch,
    });

    let files: string[] = [];

    for (const item of Array.isArray(data) ? data : [data]) {
      if (item.type === "file" && item.path.endsWith(".md")) {
        files.push(item.path);
      } else if (item.type === "dir") {
        const subFiles = await getFilesRecursively(item.path);
        files = [...files, ...subFiles];
      }
    }

    return files;
  }

  return getFilesRecursively();
}

async function selectFileByName(
  query: string,
  existingFiles: string[],
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  const prompt = `
あなたは政策提案の内容を分析し、最も適切なファイルを選択するアシスタントです。
以下の変更提案を分析し、ファイル名だけを見て、どのファイルに適用するのが最も適切か判断してください。

【ユーザーの変更提案】
${query}

【利用可能なファイル一覧】
${existingFiles.join("\n")}

【現在表示中のファイル】
${currentFilePath}

以下の形式で回答してください：
ファイルパス: [選択したファイルのパス]
理由: [選択理由の説明]
`;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content || "";
  const filePathMatch = content.match(/ファイルパス:\s*(.+)/);
  const reasonMatch = content.match(/理由:\s*(.+)/);

  const targetFilePath = filePathMatch
    ? filePathMatch[1].trim()
    : currentFilePath;
  const reason = reasonMatch
    ? `${reasonMatch[1].trim()}（ファイル名のみから判断しました）`
    : "ファイル名から最適なファイルを判断しました";

  if (!existingFiles.includes(targetFilePath)) {
    logger.warn(
      `Selected file ${targetFilePath} does not exist, using current file path`
    );
    return {
      targetFilePath: currentFilePath,
      reason: `選択されたファイル ${targetFilePath} が存在しないため、現在のファイルを使用します。`,
    };
  }

  return { targetFilePath, reason };
}

async function callLLMForFileSelection(
  query: string,
  rules: FileRule[],
  existingFiles: string[],
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  const prompt = `
あなたは政策提案の内容を分析し、最も適切なファイルを選択するアシスタントです。
以下の変更提案を分析し、どのファイルに適用するのが最も適切か判断してください。

【ユーザーの変更提案】
${query}

【利用可能なファイル一覧】
${existingFiles.join("\n")}

【ファイル選択ルール】
${rules.map((r) => `- キーワード [${r.keywords.join(", ")}] => ${r.filePath}`).join("\n")}

【現在表示中のファイル】
${currentFilePath}

以下の形式で回答してください：
ファイルパス: [選択したファイルのパス]
理由: [選択理由の説明]
`;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 1000,
  });

  const content = response.choices[0].message.content || "";
  const filePathMatch = content.match(/ファイルパス:\s*(.+)/);
  const reasonMatch = content.match(/理由:\s*(.+)/);

  const targetFilePath = filePathMatch
    ? filePathMatch[1].trim()
    : currentFilePath;
  const reason = reasonMatch
    ? `${reasonMatch[1].trim()}（リポジトリのルールファイルに基づいて判断しました）`
    : "リポジトリのルールファイルに基づいて最適なファイルを判断しました";

  if (!existingFiles.includes(targetFilePath)) {
    logger.warn(
      `Selected file ${targetFilePath} does not exist, using current file path`
    );
    return {
      targetFilePath: currentFilePath,
      reason: `選択されたファイル ${targetFilePath} が存在しないため、現在のファイルを使用します。`,
    };
  }

  return { targetFilePath, reason };
}
