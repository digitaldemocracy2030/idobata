import fs from "node:fs";
import { App } from "@octokit/app";
import { Octokit } from "@octokit/rest";
import {
  GITHUB_API_BASE_URL,
  GITHUB_APP_ID,
  GITHUB_INSTALLATION_ID,
  GITHUB_PRIVATE_KEY_PATH,
} from "../config.js";
import { logger } from "../utils/logger.js";

let app: App | null = null;
let installationOctokit: Octokit | null = null;

function getPrivateKey(): string {
  const keyPath = GITHUB_PRIVATE_KEY_PATH;
  try {
    logger.info(`Reading GitHub App private key from file: ${keyPath}`);
    return fs.readFileSync(keyPath, "utf8");
  } catch (error) {
    logger.error("Failed to read GitHub App private key from file", error);
    throw new Error(
      `Could not read GitHub App private key file from ${keyPath}. Ensure the file exists and has correct permissions.`
    );
  }
}

function getApp(): App {
  if (!app) {
    if (!GITHUB_APP_ID) {
      throw new Error("GITHUB_APP_ID is not configured.");
    }
    const privateKey = getPrivateKey();
    app = new App({
      appId: GITHUB_APP_ID,
      privateKey,
      webhooks: { secret: "dummy-secret" },
      Octokit: Octokit.defaults(
        GITHUB_API_BASE_URL ? { baseUrl: GITHUB_API_BASE_URL } : {}
      ),
    });
    logger.info("GitHub App initialized.");
  }
  return app;
}

export async function getAuthenticatedOctokit(): Promise<Octokit> {
  if (!installationOctokit) {
    logger.info("Initializing GitHub installation Octokit instance...");
    try {
      const appInstance = getApp();
      const installationId = Number.parseInt(GITHUB_INSTALLATION_ID ?? "", 10);
      if (Number.isNaN(installationId)) {
        throw new Error("Invalid GITHUB_INSTALLATION_ID. Must be a number.");
      }

      installationOctokit = (await appInstance.getInstallationOctokit(
        installationId
      )) as unknown as Octokit;

      logger.info(
        `Initialized Octokit instance for installation ID: ${installationId}`
      );
    } catch (error) {
      logger.error("Failed to get GitHub installation token", error);
      throw new Error("Could not authenticate with GitHub App.");
    }
  } else {
    logger.debug("Using cached GitHub installation token.");
  }
  return installationOctokit;
}
