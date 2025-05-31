import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { Octokit } from "@octokit/rest";
import { Result, err, ok } from "neverthrow";
import { z } from "zod";
import config from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import { ensureBranchExists } from "../github/utils.js";
import logger from "../logger.js";
import { GitHubApiError } from "../types/errors.js";
import { trimTrailingContentSeparators } from "../utils/stringUtils.js";

export const upsertFileSchema = z.object({
  // Temporarily remove refine to check type error
  filePath: z.string(),
  // filePath: z.string().refine(fp => fp.endsWith('.md') && !fp.includes('..'), {
  //   message: "filePath must end with .md and not contain '..'",
  // }),
  branchName: z.string().min(1),
  content: z.string(), // 空の内容も許可する場合があるため min(1) はつけない
  commitMessage: z.string().min(1),
});

export type UpsertFileInput = z.infer<typeof upsertFileSchema>;

export async function handleUpsertFile(
  params: UpsertFileInput
): Promise<CallToolResult> {
  // Restore refine validation manually inside the handler for now
  if (!params.filePath.endsWith(".md") || params.filePath.includes("..")) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: "Invalid filePath: must end with .md and not contain '..'",
        },
      ],
    };
  }

  const { filePath, branchName, content, commitMessage } = params;
  const owner = config.GITHUB_TARGET_OWNER;
  const repo = config.GITHUB_TARGET_REPO;
  // Ensure filePath doesn't start with '/' as path.posix.join might behave unexpectedly.
  const fullPath = filePath.startsWith("/") ? filePath.substring(1) : filePath;

  logger.info(
    { owner, repo, branchName, fullPath },
    "Handling upsert_file_and_commit request"
  );

  const octokitResult = await getAuthenticatedOctokit();
  if (octokitResult.isErr()) {
    return {
      isError: true,
      content: [
        {
          type: "text",
          text: `Authentication failed: ${octokitResult.error.message}`,
        },
      ],
    };
  }

  const octokit = octokitResult.value;

  try {
    // 1. ブランチの存在確認・作成
    await ensureBranchExists(octokit, branchName);

    // 2. 既存ファイル情報取得 (SHA取得のため)
    const fileContentResult = await getFileContent(
      octokit,
      owner,
      repo,
      fullPath,
      branchName
    );
    if (fileContentResult.isErr()) {
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `Failed to get file content: ${fileContentResult.error.message}`,
          },
        ],
      };
    }

    const currentSha = fileContentResult.value?.sha;

    // 3. ファイル作成/更新
    logger.info(
      `${currentSha ? "Updating" : "Creating"} file ${fullPath} in branch ${branchName}`
    );
    const { data: updateResult } =
      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: fullPath,
        message: commitMessage,
        content: Buffer.from(
          trimTrailingContentSeparators(content),
          "utf8"
        ).toString("base64"),
        branch: branchName,
        sha: currentSha, // 存在する場合のみSHAを指定 (更新)
      });

    const commitSha = updateResult.commit.sha;
    // updateResult.content が null でないことを確認してから html_url にアクセス
    const htmlUrl = updateResult.content?.html_url || "#"; // URLが取得できない場合も考慮
    logger.info(`Successfully committed to ${fullPath} (SHA: ${commitSha})`);

    return {
      content: [
        {
          type: "text",
          text: `Successfully committed changes to ${filePath} (SHA: ${commitSha}). View file: ${htmlUrl}`,
        },
      ],
    };
  } catch (error: unknown) {
    logger.error(
      { error, params },
      `Error processing upsert_file_and_commit for ${filePath}`
    );
    // Type check before accessing properties
    let errorMessage = "Unknown error";
    let status = "";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check if 'status' property exists (common in HTTP errors like from Octokit)
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
          text: `Error processing file ${filePath}: ${errorMessage}${status}`,
        },
      ],
    };
  }
}

async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  filePath: string,
  branchName: string
): Promise<Result<{ sha: string; content: string } | null, GitHubApiError>> {
  try {
    const { data: contentData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref: branchName,
    });

    // contentDataが配列の場合 (ディレクトリの場合など) はエラーとする
    if (Array.isArray(contentData)) {
      return err(
        new GitHubApiError(
          `Path ${filePath} refers to a directory, not a file.`
        )
      );
    }

    // contentData が null や undefined でないこと、および type プロパティが存在することを確認
    if (contentData && contentData.type === "file") {
      // contentData が file の場合、sha プロパティが存在することを確認
      if ("sha" in contentData && "content" in contentData) {
        const decodedContent = Buffer.from(
          contentData.content,
          "base64"
        ).toString("utf8");
        logger.debug(
          `Found existing file ${filePath} with SHA: ${contentData.sha}`
        );
        return ok({ sha: contentData.sha, content: decodedContent });
      }
      logger.warn(
        `Path ${filePath} is a file but SHA or content is missing. Proceeding without SHA.`
      );
      return ok(null);
    }
    if (contentData) {
      logger.warn(
        `Path ${filePath} exists but is not a file (type: ${contentData.type}). Proceeding to overwrite.`
      );
      return ok(null);
    }
    // contentData が null や undefined の場合 (通常は 404 になるはずだが念のため)
    logger.info(
      `Could not retrieve content data for ${filePath}. Assuming file does not exist.`
    );
    return ok(null);
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      logger.info(
        `File ${filePath} does not exist in branch ${branchName}. Will create it.`
      );
      return ok(null);
    }
    return err(
      new GitHubApiError(
        `Failed to get file content: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
  }
}
