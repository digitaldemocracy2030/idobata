import { GITHUB_TARGET_OWNER, GITHUB_TARGET_REPO } from "../config.js";
import { getAuthenticatedOctokit } from "../github/client.js";
import { findOrCreateDraftPr } from "../github/utils.js";
import { logger } from "../utils/logger.js";
import { trimTrailingContentSeparators } from "../utils/stringUtils.js";

interface UpdatePrInput {
  branchName: string;
  title?: string;
  description: string;
}

export const updatePrInputSchema = {
  type: "object",
  properties: {
    branchName: {
      type: "string",
      description: "Name of the branch whose pull request should be updated.",
    },
    title: {
      type: "string",
      description: "New title for the pull request (optional).",
    },
    description: {
      type: "string",
      description: "New description (body) for the pull request.",
    },
  },
  required: ["branchName", "description"],
} as const;

function parseInput(args: Record<string, unknown>): UpdatePrInput {
  const { branchName, title, description } = args;
  if (typeof branchName !== "string" || branchName.length === 0) {
    throw new Error("branchName is required and must be a string");
  }
  if (typeof description !== "string") {
    throw new Error("description is required and must be a string");
  }
  if (title !== undefined && typeof title !== "string") {
    throw new Error("title must be a string if provided");
  }
  return { branchName, title, description };
}

export async function handleUpdatePr(
  args: Record<string, unknown>
): Promise<string> {
  const { branchName, title, description } = parseInput(args);
  const owner = GITHUB_TARGET_OWNER ?? "";
  const repo = GITHUB_TARGET_REPO ?? "";

  logger.info("Handling update_pr request", { owner, repo, branchName });

  const octokit = await getAuthenticatedOctokit();

  const defaultPrTitle = `WIP: Changes for ${branchName}`;
  const prInfo = await findOrCreateDraftPr(
    octokit,
    branchName,
    defaultPrTitle,
    description
  );
  const pull_number = prInfo.number;
  const prHtmlUrl = prInfo.html_url;

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
    body: trimTrailingContentSeparators(description),
  };

  if (title) {
    updatePayload.title = title;
    logger.info(`Updating title and description for PR #${pull_number}`);
  } else {
    logger.info(`Updating description for PR #${pull_number}`);
  }

  await octokit.rest.pulls.update({ ...updatePayload });

  const updatedFields = title ? "title and description" : "description";
  logger.info(
    `Successfully ensured PR #${pull_number} exists and updated ${updatedFields}. URL: ${prHtmlUrl}`
  );

  return `Successfully updated pull request ${updatedFields}. View PR: ${prHtmlUrl}`;
}
