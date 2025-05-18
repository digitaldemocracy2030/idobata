import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import * as config from "../../config.js";
import { logger } from "../../utils/logger.js";
import { FactCheckUseCase } from "./FactCheckUseCase.js";

export function createFactCheckUseCase(): FactCheckUseCase {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const openaiClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: config.OPENROUTER_API_KEY,
  });

  const validCredential =
    config.FACTCHECK_CREDENTIAL || "default-credential-for-development";

  return new FactCheckUseCase(octokit, openaiClient, validCredential, logger);
}
