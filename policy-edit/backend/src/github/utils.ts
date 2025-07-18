import type { Octokit } from "@octokit/rest";
import {
  GITHUB_BASE_BRANCH,
  GITHUB_TARGET_OWNER,
  GITHUB_TARGET_REPO,
} from "../config.js";
import { trimTrailingContentSeparators } from "../utils/stringUtils.js";

export async function ensureBranchExists(
  octokit: Octokit,
  branchName: string
): Promise<void> {
  if (!GITHUB_TARGET_OWNER || !GITHUB_TARGET_REPO || !GITHUB_BASE_BRANCH) {
    throw new Error("GitHub configuration environment variables are required");
  }
  const owner = GITHUB_TARGET_OWNER;
  const repo = GITHUB_TARGET_REPO;
  const baseBranch = GITHUB_BASE_BRANCH;

  console.log(`Ensuring branch ${branchName} exists...`);

  let branchExists = false;
  try {
    await octokit.rest.git.getRef({
      owner,
      repo,
      ref: `heads/${branchName}`,
    });
    branchExists = true;
    console.log(`Branch ${branchName} already exists.`);
  } catch (error: unknown) {
    if (error instanceof Error && "status" in error && error.status === 404) {
      console.log(`Branch ${branchName} does not exist. Creating...`);
    } else {
      console.error(`Failed to check branch ${branchName}`, error);
      throw error;
    }
  }

  if (!branchExists) {
    try {
      const { data: baseRefData } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${baseBranch}`,
      });
      const baseSha = baseRefData.object.sha;
      console.log(`Base branch (${baseBranch}) SHA: ${baseSha}`);

      await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      });
      console.log(`Branch ${branchName} created from ${baseBranch}.`);
    } catch (error) {
      console.error(`Failed to create branch ${branchName}`, error);
      throw error;
    }
  }
}

export async function findOrCreateDraftPr(
  octokit: Octokit,
  branchName: string,
  title: string,
  body: string
): Promise<{ number: number; html_url: string }> {
  if (!GITHUB_TARGET_OWNER || !GITHUB_TARGET_REPO || !GITHUB_BASE_BRANCH) {
    throw new Error("GitHub configuration environment variables are required");
  }
  const owner = GITHUB_TARGET_OWNER;
  const repo = GITHUB_TARGET_REPO;
  const baseBranch = GITHUB_BASE_BRANCH;
  const head = `${owner}:${branchName}`;

  console.log(`Finding or creating draft PR for branch ${branchName}...`);

  try {
    const { data: existingPrs } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: "open",
      head: head,
      base: baseBranch,
    });

    if (existingPrs.length > 0) {
      const pr = existingPrs[0];
      console.log(
        `Found existing open PR #${pr.number} for branch ${branchName}.`
      );
      if (existingPrs.length > 1) {
        console.warn(
          `Multiple open PRs found for branch ${branchName}. Using the first one: #${pr.number}`
        );
      }
      return { number: pr.number, html_url: pr.html_url };
    }

    console.log(
      `No open PR found for branch ${branchName}. Creating draft PR...`
    );
    const { data: newPr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: title,
      head: branchName,
      base: baseBranch,
      body: trimTrailingContentSeparators(body),
      draft: true,
    });
    console.log(
      `Created draft PR #${newPr.number} for branch ${branchName}. URL: ${newPr.html_url}`
    );
    return { number: newPr.number, html_url: newPr.html_url };
  } catch (error) {
    console.error(
      `Failed to find or create PR for branch ${branchName}`,
      error
    );
    throw error;
  }
}
