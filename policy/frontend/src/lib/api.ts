import { ChatApiClient } from "./chatApiClient";
import { createGitHubClient } from "./github";

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001/api";

export const chatApiClient = new ChatApiClient(API_BASE_URL);
export const gitHubClient = createGitHubClient();
