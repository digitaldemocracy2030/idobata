import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Result, err, ok } from "neverthrow";
import config from "./config.js"; // 環境変数を読み込むため
import { getAuthenticatedOctokit } from "./github/client.js"; // Import the client
import logger from "./logger.js";
import server from "./server.js";
import { McpServerError } from "./types/errors.js";

async function main() {
  logger.info(
    `Starting github-contribution-mcp server (Log Level: ${config.LOG_LEVEL || "info"})...`
  );

  // Stdioトランスポートを作成
  const transport = new StdioServerTransport();

  const connectResult = await connectServer(transport);
  if (connectResult.isErr()) {
    logger.error({ error: connectResult.error }, "Failed to connect server");
    process.exit(1);
  }

  // --- Temporary GitHub Authentication Test ---
  const authTestResult = await testGitHubAuthentication();
  if (authTestResult.isErr()) {
    logger.error(
      { error: authTestResult.error },
      "GitHub authentication test failed."
    );
    // Optionally exit if auth fails, depending on requirements
    // process.exit(1);
  } else {
    logger.info("GitHub authentication test successful.");
  }
  // --- End Temporary Test ---
}

const connectServer = async (
  transport: StdioServerTransport
): Promise<Result<void, McpServerError>> => {
  try {
    await server.connect(transport);
    logger.info("Server connected via Stdio. Waiting for requests...");
    return ok(undefined);
  } catch (error) {
    return err(
      new McpServerError(
        `Failed to connect server: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
  }
};

const testGitHubAuthentication = async (): Promise<
  Result<void, McpServerError>
> => {
  try {
    logger.info("Testing GitHub authentication...");
    const octokitResult = await getAuthenticatedOctokit();
    if (octokitResult.isErr()) {
      return err(
        new McpServerError(
          `Authentication failed: ${octokitResult.error.message}`
        )
      );
    }

    const octokit = octokitResult.value;
    // Use octokit.rest.apps.getAuthenticated() which is available on the InstallationOctokit type
    const { data: appData } = await octokit.rest.apps.getAuthenticated();
    // Safely access appData.name with optional chaining
    logger.info(
      `Authenticated as GitHub App: ${appData?.name || "Unknown App Name"}`
    );
    const { data: repoData } = await octokit.rest.repos.get({
      owner: config.GITHUB_TARGET_OWNER,
      repo: config.GITHUB_TARGET_REPO,
    });
    logger.info(
      `Successfully accessed target repository: ${repoData.full_name}`
    );
    return ok(undefined);
  } catch (error) {
    return err(
      new McpServerError(
        `GitHub authentication test failed: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
  }
};

main();
