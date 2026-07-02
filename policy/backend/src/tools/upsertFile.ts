import { GITHUB_TARGET_OWNER, GITHUB_TARGET_REPO } from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import { resolveTargetPath } from "../github/paths.js";
import { ensureBranchExists } from "../github/utils.js";
import { logger } from "../utils/logger.js";
import { trimTrailingContentSeparators } from "../utils/stringUtils.js";

interface UpsertFileInput {
  filePath: string;
  branchName: string;
  content: string;
  commitMessage: string;
}

export const upsertFileInputSchema = {
  type: "object",
  properties: {
    filePath: {
      type: "string",
      description:
        "Path of the Markdown file to create or update (must end with .md).",
    },
    branchName: {
      type: "string",
      description: "Name of the working branch.",
    },
    content: {
      type: "string",
      description: "Full new content of the file.",
    },
    commitMessage: {
      type: "string",
      description: "Commit message describing the change.",
    },
  },
  required: ["filePath", "branchName", "content", "commitMessage"],
} as const;

function parseInput(args: Record<string, unknown>): UpsertFileInput {
  const { filePath, branchName, content, commitMessage } = args;
  if (typeof filePath !== "string" || filePath.length === 0) {
    throw new Error("filePath is required and must be a string");
  }
  if (typeof branchName !== "string" || branchName.length === 0) {
    throw new Error("branchName is required and must be a string");
  }
  if (typeof content !== "string") {
    throw new Error("content is required and must be a string");
  }
  if (typeof commitMessage !== "string" || commitMessage.length === 0) {
    throw new Error("commitMessage is required and must be a string");
  }
  return { filePath, branchName, content, commitMessage };
}

export async function handleUpsertFile(
  args: Record<string, unknown>
): Promise<string> {
  const params = parseInput(args);

  if (!params.filePath.endsWith(".md") || params.filePath.includes("..")) {
    throw new Error("Invalid filePath: must end with .md and not contain '..'");
  }

  const { filePath, branchName, content, commitMessage } = params;
  const owner = GITHUB_TARGET_OWNER ?? "";
  const repo = GITHUB_TARGET_REPO ?? "";
  // Scope the (folder-relative) path to GITHUB_TARGET_PATH so writes cannot
  // escape the configured subdirectory.
  const fullPath = resolveTargetPath(filePath);

  logger.info("Handling upsert_file_and_commit request", {
    owner,
    repo,
    branchName,
    fullPath,
  });

  const octokit = await getAuthenticatedOctokit();

  await ensureBranchExists(octokit, branchName);

  let currentSha: string | undefined = undefined;
  try {
    const { data: contentData } = await octokit.rest.repos.getContent({
      owner,
      repo,
      path: fullPath,
      ref: branchName,
    });
    if (Array.isArray(contentData)) {
      throw new Error(`Path ${fullPath} refers to a directory, not a file.`);
    }
    if (contentData && contentData.type === "file") {
      if ("sha" in contentData) {
        currentSha = contentData.sha;
        logger.debug(`Found existing file ${fullPath} with SHA: ${currentSha}`);
      } else {
        logger.warn(
          `Path ${fullPath} is a file but SHA is missing. Proceeding without SHA.`
        );
      }
    } else if (contentData) {
      logger.warn(
        `Path ${fullPath} exists but is not a file (type: ${contentData.type}). Proceeding to overwrite.`
      );
    } else {
      logger.info(
        `Could not retrieve content data for ${fullPath}. Assuming file does not exist.`
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      logger.info(
        `File ${fullPath} does not exist in branch ${branchName}. Will create it.`
      );
    } else {
      logger.error(`Failed to get content for ${fullPath}`, error);
      throw error;
    }
  }

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
      sha: currentSha,
    });

  const commitSha = updateResult.commit.sha;
  const htmlUrl = updateResult.content?.html_url || "#";
  logger.info(`Successfully committed to ${fullPath} (SHA: ${commitSha})`);

  return `Successfully committed changes to ${filePath} (SHA: ${commitSha}). View file: ${htmlUrl}`;
}
