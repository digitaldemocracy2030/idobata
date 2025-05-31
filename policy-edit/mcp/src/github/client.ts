import fs from "node:fs";
import path from "node:path";
import { App } from "@octokit/app";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods"; // Use the documented type export
import { Octokit } from "@octokit/rest";
import { Result, err, ok } from "neverthrow";
import config from "../config.js";
import logger from "../logger.js";
import { AuthenticationError, FileSystemError } from "../types/errors.js";

let app: App | null = null;
// Define a more specific type for the cached Octokit instance
// Define the custom Octokit class with the REST methods plugin
const OctokitWithRest = Octokit.plugin(restEndpointMethods);
// Define a type for the Octokit instance returned by the App, using the plugin's types
type InstallationOctokit = InstanceType<typeof OctokitWithRest> & {
  rest: RestEndpointMethodTypes;
};
let installationOctokit: InstallationOctokit | null = null;
// tokenExpiration is removed as getInstallationOctokit likely handles token refresh.

function getPrivateKey(): Result<string, FileSystemError> {
  const keyPath = "/app/secrets/github-key.pem"; // Fixed path inside the container
  try {
    logger.info(`Reading private key from file: ${keyPath}`);
    const privateKey = fs.readFileSync(keyPath, "utf8");
    return ok(privateKey);
  } catch (error) {
    logger.error(
      { error, path: keyPath },
      "Failed to read private key from file"
    );
    return err(
      new FileSystemError(
        `Could not read GitHub App private key file from ${keyPath}. Ensure the file exists and has correct permissions.`
      )
    );
  }
}

function getApp(): Result<App, FileSystemError> {
  if (!app) {
    const privateKeyResult = getPrivateKey();
    if (privateKeyResult.isErr()) {
      return err(privateKeyResult.error);
    }

    app = new App({
      appId: config.GITHUB_APP_ID,
      privateKey: privateKeyResult.value,
      webhooks: { secret: "dummy-secret" }, // Webhookを使わない場合でも必要
      // Use the custom Octokit class that includes the REST plugin
      Octokit: OctokitWithRest.defaults({
        baseUrl: config.GITHUB_API_BASE_URL, // Apply base URL if provided
      }),
    });
    logger.info("GitHub App initialized.");
  }
  return ok(app);
}

// Adjust return type to match the specific InstallationOctokit type
export async function getAuthenticatedOctokit(): Promise<
  Result<InstallationOctokit, AuthenticationError | FileSystemError>
> {
  // Check if we already have a cached Octokit instance.
  // getInstallationOctokit might handle caching/refresh, but this adds a layer.
  if (!installationOctokit) {
    logger.info("Initializing GitHub installation Octokit instance...");
    try {
      const appResult = getApp();
      if (appResult.isErr()) {
        return err(appResult.error);
      }

      const appInstance = appResult.value;
      const installationId = Number.parseInt(config.GITHUB_INSTALLATION_ID, 10);
      if (Number.isNaN(installationId)) {
        return err(
          new AuthenticationError(
            "Invalid GITHUB_INSTALLATION_ID. Must be a number."
          )
        );
      }

      // Directly get the authenticated Octokit instance for the installation
      // This method handles token generation and potentially caching/refresh internally.
      // Cast the result to the specific type we need
      installationOctokit = (await appInstance.getInstallationOctokit(
        installationId
      )) as InstallationOctokit;

      logger.info(
        `Initialized Octokit instance for installation ID: ${installationId}`
      );
    } catch (error) {
      logger.error({ error }, "Failed to get GitHub installation token");
      return err(
        new AuthenticationError("Could not authenticate with GitHub App.")
      );
    }
  } else {
    logger.debug("Using cached GitHub installation token.");
  }
  return ok(installationOctokit);
}
