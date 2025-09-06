import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import config from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import logger from "../logger.js";

export const getFileContentSchema = z.object({
  filePath: z.string().min(1),
  branchName: z.string().optional().default("main"),
});

export type GetFileContentInput = z.infer<typeof getFileContentSchema>;

export async function handleGetFileContent(
  params: GetFileContentInput
): Promise<CallToolResult> {
  const { filePath, branchName } = params;
  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;
  const fullPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;

  logger.info(
    { owner, repo, branchName, fullPath },
    "Handling get_file_content request"
  );

  try {
    const octokit = await getAuthenticatedOctokit();

    // ファイル内容を取得
    const { data: contentData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: fullPath,
      ref: branchName,
    });

    // contentDataが配列の場合 (ディレクトリの場合など) はエラー
    if (Array.isArray(contentData)) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Path ${fullPath} refers to a directory, not a file.`,
          },
        ],
      };
    }

    // contentData が null や undefined でないこと、および type プロパティが存在することを確認
    if (!contentData || contentData.type !== "file") {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Path ${fullPath} is not a file or does not exist.`,
          },
        ],
      };
    }

    // Base64デコード
    if ("content" in contentData) {
      const decodedContent = Buffer.from(contentData.content, "base64").toString(
        "utf8"
      );
      
      return {
        content: [
          {
            type: "text",
            text: `File: ${fullPath}\n` +
                  `Size: ${contentData.size} bytes\n` +
                  `Last modified: ${contentData.sha}\n\n` +
                  `Content:\n\`\`\`\n${decodedContent}\n\`\`\``,
          },
        ],
      };
    } else {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Unable to retrieve content for ${fullPath}. File may be too large or binary.`,
          },
        ],
      };
    }
  } catch (error: unknown) {
    logger.error(
      { error, params },
      `Error processing get_file_content for ${fullPath}`
    );

    let errorMessage = "Unknown error";
    let status = "";
    if (error instanceof Error) {
      errorMessage = error.message;
      if ("status" in error && typeof error.status === "number") {
        status = ` (Status: ${error.status})`;
        
        // 404エラーの場合は親切なメッセージを返す
        if (error.status === 404) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: `File ${fullPath} not found in branch ${branchName}.`,
              },
            ],
          };
        }
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error retrieving file ${fullPath}: ${errorMessage}${status}`,
        },
      ],
    };
  }
}