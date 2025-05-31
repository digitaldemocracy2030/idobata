import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Result, err, ok } from "neverthrow";
import { z } from "zod";
import config from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import { findOrCreateDraftPr } from "../github/utils.js"; // findOrCreateDraftPr をインポート
import logger from "../logger.js";
import { GitHubApiError } from "../types/errors.js";
import { trimTrailingContentSeparators } from "../utils/stringUtils.js";

export const updatePrSchema = z.object({
  branchName: z.string().min(1),
  title: z.string().optional(), // タイトルをオプショナルで追加
  description: z.string(), // 空の説明も許可
});

export type UpdatePrInput = z.infer<typeof updatePrSchema>;

export async function handleUpdatePr(
  params: UpdatePrInput
): Promise<CallToolResult> {
  const { branchName, title, description } = params;
  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;
  // head format は utils 内で処理されるためここでは不要

  logger.info(
    { owner, repo, branchName, title: !!title },
    "Handling update_pr request"
  );

  const updatePrResult = await updatePrInternal(
    owner,
    repo,
    branchName,
    title,
    description
  );
  if (updatePrResult.isErr()) {
    return {
      content: [
        {
          type: "text",
          text: `Failed to update PR: ${updatePrResult.error.message}`,
        },
      ],
      isError: true,
    };
  }

  const updatedFields = title ? "title and description" : "description";
  return {
    content: [
      {
        type: "text",
        text: `Successfully updated pull request ${updatedFields}. View PR: ${updatePrResult.value.html_url}`,
      },
    ],
  };
}

async function updatePrInternal(
  owner: string,
  repo: string,
  branchName: string,
  title?: string,
  description?: string
): Promise<Result<{ html_url: string }, GitHubApiError>> {
  try {
    const octokitResult = await getAuthenticatedOctokit();
    if (octokitResult.isErr()) {
      return err(
        new GitHubApiError(
          `Authentication failed: ${octokitResult.error.message}`
        )
      );
    }

    const octokit = octokitResult.value;

    // 1. PRを検索または作成
    // 新規作成時のデフォルトタイトル（title が指定されていない場合に使用）
    const defaultPrTitle = `WIP: Changes for ${branchName}`;
    // findOrCreateDraftPr は description を新規作成時の body として使用する
    const prInfo = await findOrCreateDraftPr(
      octokit,
      branchName,
      defaultPrTitle,
      description || ""
    );
    const pull_number = prInfo.number;
    const prHtmlUrl = prInfo.html_url; // PRのURLを取得

    // 2. PRの説明文を更新
    // 2. PRのタイトルと説明文を更新
    const updatePayload: {
      owner: string;
      repo: string;
      pull_number: number;
      body: string;
      title?: string;
    } = {
      owner,
      repo,
      pull_number,
      body: trimTrailingContentSeparators(description || ""),
    };

    if (title) {
      updatePayload.title = title;
      logger.info(`Updating title and description for PR #${pull_number}`);
    } else {
      logger.info(`Updating description for PR #${pull_number}`);
    }

    const { data: updatedPr } = await octokit.rest.pulls.update({
      ...updatePayload,
    });

    // findOrCreateDraftPr で作成された場合、description は既に設定されているが、
    // 既存PRの場合に更新が必要なため、常に update を呼び出す (冪等性のため問題ない)
    const updatedFields = title ? "title and description" : "description";
    logger.info(
      `Successfully ensured PR #${pull_number} exists and updated ${updatedFields}. URL: ${prHtmlUrl}`
    );

    return ok({ html_url: prHtmlUrl });
  } catch (error: unknown) {
    logger.error(
      { error, owner, repo, branchName, title, description },
      "Failed to update PR"
    );
    return err(
      new GitHubApiError(
        `Failed to update PR: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
  }
}
