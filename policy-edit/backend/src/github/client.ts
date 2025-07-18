import fs from "node:fs";
import { App } from "@octokit/app";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import type { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods";
import { Octokit } from "@octokit/rest";
import {
  GITHUB_API_BASE_URL,
  GITHUB_APP_ID,
  GITHUB_INSTALLATION_ID,
} from "../config.js";

let app: App | null = null;
const OctokitWithRest = Octokit.plugin(restEndpointMethods);
type InstallationOctokit = InstanceType<typeof OctokitWithRest> & {
  rest: RestEndpointMethodTypes;
};
let installationOctokit: InstallationOctokit | null = null;

function getPrivateKey(): string {
  const keyPath = "/app/secrets/github-key.pem";
  try {
    console.log(`Reading private key from file: ${keyPath}`);
    return fs.readFileSync(keyPath, "utf8");
  } catch (error) {
    console.error(`Failed to read private key from file: ${keyPath}`, error);
    throw new Error(
      `Could not read GitHub App private key file from ${keyPath}. Ensure the file exists and has correct permissions.`
    );
  }
}

function getApp(): App {
  if (!app) {
    const privateKey = getPrivateKey();
    if (!GITHUB_APP_ID) {
      throw new Error("GITHUB_APP_ID environment variable is required");
    }
    app = new App({
      appId: GITHUB_APP_ID,
      privateKey: privateKey,
      webhooks: { secret: "dummy-secret" },
      Octokit: OctokitWithRest.defaults({
        baseUrl: GITHUB_API_BASE_URL,
      }),
    });
    console.log("GitHub App initialized.");
  }
  return app;
}

export async function getAuthenticatedOctokit(): Promise<InstallationOctokit> {
  if (!installationOctokit) {
    console.log("Initializing GitHub installation Octokit instance...");
    try {
      const appInstance = getApp();
      if (!GITHUB_INSTALLATION_ID) {
        throw new Error(
          "GITHUB_INSTALLATION_ID environment variable is required"
        );
      }
      const installationId = Number.parseInt(GITHUB_INSTALLATION_ID, 10);
      if (Number.isNaN(installationId)) {
        throw new Error("Invalid GITHUB_INSTALLATION_ID. Must be a number.");
      }

      installationOctokit = (await appInstance.getInstallationOctokit(
        installationId
      )) as InstallationOctokit;

      console.log(
        `Initialized Octokit instance for installation ID: ${installationId}`
      );
    } catch (error) {
      console.error("Failed to get GitHub installation token", error);
      throw new Error("Could not authenticate with GitHub App.");
    }
  } else {
    console.log("Using cached GitHub installation token.");
  }
  return installationOctokit;
}
