import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import config from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import logger from "../logger.js";

export const searchFilesSchema = z.object({
  keywords: z.string().min(1),
  limit: z.number().min(1).max(20).optional().default(10),
});

export type SearchFilesInput = z.infer<typeof searchFilesSchema>;

export async function handleSearchFiles(
  params: SearchFilesInput
): Promise<CallToolResult> {
  const { keywords, limit } = params;
  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;

  logger.info(
    { owner, repo, keywords, limit },
    "Handling search_repository_files request"
  );

  try {
    const octokit = await getAuthenticatedOctokit();

    // GitHub Search API を使用してリポジトリ内のファイルを検索
    const searchQuery = `${keywords} repo:${owner}/${repo} extension:md`;
    const { data: searchResult } = await octokit.rest.search.code({
      q: searchQuery,
      per_page: limit,
    });

    if (searchResult.items.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `No files found containing "${keywords}" in the repository.`,
          },
        ],
      };
    }

    // 検索結果をフォーマット
    const results = searchResult.items.map((item) => ({
      name: item.name,
      path: item.path,
      score: item.score,
      html_url: item.html_url,
    }));

    const formattedResults = results
      .map((result) => 
        `**${result.name}** (${result.path})\n` +
        `Score: ${result.score}\n` +
        `URL: ${result.html_url}`
      )
      .join('\n\n');

    return {
      content: [
        {
          type: "text",
          text: `Found ${results.length} files containing "${keywords}":\n\n${formattedResults}`,
        },
      ],
    };
  } catch (error: unknown) {
    logger.error(
      { error, params },
      `Error processing search_repository_files for keywords: ${keywords}`
    );

    let errorMessage = "Unknown error";
    let status = "";
    if (error instanceof Error) {
      errorMessage = error.message;
      if ("status" in error && typeof error.status === "number") {
        status = ` (Status: ${error.status})`;
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Error searching for "${keywords}": ${errorMessage}${status}`,
        },
      ],
    };
  }
}