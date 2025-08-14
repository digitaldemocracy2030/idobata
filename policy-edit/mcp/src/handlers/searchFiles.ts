import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import config from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import logger from "../logger.js";

export const searchFilesSchema = z.object({
  keywords: z.string().min(1, "Search keywords are required"),
  limit: z.number().min(1).max(30).optional().default(10),
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
      per_page: Math.min(limit, 30), // GitHub Search API has a max of 100 per page, but we limit to 30
      sort: 'indexed',
      order: 'desc',
      text_match: true, // Enable text matches to show relevant snippets
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

    // 検索結果をフォーマット（text_matchesを含む）
    const results = searchResult.items.map((item) => ({
      filename: item.name,
      path: item.path,
      score: item.score,
      matches: item.text_matches?.map(match => ({
        fragment: match.fragment,
        property: match.property
      })) || []
    }));

    // 結果を見やすくフォーマット
    const formattedResults = results
      .map((result) => {
        let text = `**${result.filename}** (${result.path})\n`;
        text += `Score: ${result.score}\n`;
        
        // 該当箇所を表示
        if (result.matches.length > 0) {
          text += `該当箇所:\n`;
          result.matches.forEach(match => {
            text += `\`\`\`\n${match.fragment}\n\`\`\`\n`;
          });
        }
        
        return text;
      })
      .join('\n---\n\n');

    return {
      content: [
        {
          type: "text",
          text: `検索結果 (${searchResult.total_count}件中${searchResult.items.length}件表示):\n\n${formattedResults}`,
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
        
        // Rate limit specific handling
        if (error.status === 403 && errorMessage.includes('rate limit')) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: "検索APIのレート制限に達しました。しばらく待ってから再度お試しください。"
              }
            ]
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
          text: `Error searching for "${keywords}": ${errorMessage}${status}`,
        },
      ],
    };
  }
}