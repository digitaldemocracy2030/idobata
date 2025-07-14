import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { handleUpdatePr, updatePrSchema } from "./handlers/updatePr.js"; // インポート追加
// import { z } from 'zod'; // Zod is imported in handlers now
import { handleUpsertFile, upsertFileSchema } from "./handlers/upsertFile.js"; // インポート追加
import { handleSearchFiles, searchFilesSchema } from "./handlers/searchFiles.js";
import { handleGetFileContent, getFileContentSchema } from "./handlers/getFileContent.js";
import logger from "./logger.js";

// サーバーインスタンスを作成
const server = new McpServer({
  name: "github-contribution-mcp",
  version: "0.1.0", // package.jsonのバージョンと合わせるのが良い
}); // Remove logger argument, seems not supported in McpServer constructor

// --- ここにツールやリソースのハンドラを追加していく ---

// upsert_file_and_commit ツールを登録
const upsertFileAnnotations = {
  title: "Update File and Commit",
  readOnlyHint: false,
  destructiveHint: false, // 上書きはするが破壊的ではない
  idempotentHint: false, // 同じ内容でもコミットは増える
  openWorldHint: false, // GitHubという閉じた環境
};

server.tool(
  "upsert_file_and_commit",
  "Creates or updates a specified Markdown file in a branch and commits the changes. Automatically creates the branch and a draft pull request if they don't exist.",
  upsertFileSchema.shape, // Pass the Zod schema shape
  upsertFileAnnotations,
  handleUpsertFile // Pass the handler function
);

// update_pr_description ツールを登録
const updatePrAnnotations = {
  title: "Update Pull Request Title and Description",
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true, // 同じ説明文なら結果は同じ
  openWorldHint: false,
};

server.tool(
  "update_pr",
  "Updates the title and/or description (body) of the open pull request associated with the specified branch.",
  updatePrSchema.shape, // Pass the Zod schema shape
  updatePrAnnotations,
  handleUpdatePr // Pass the handler function
);

// search_repository_files ツールを登録
const searchFilesAnnotations = {
  title: "Search Repository Files",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

server.tool(
  "search_repository_files",
  "Search for content across all files in the repository using keywords",
  searchFilesSchema.shape,
  searchFilesAnnotations,
  handleSearchFiles
);

// get_file_content ツールを登録
const getFileContentAnnotations = {
  title: "Get File Content",
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

server.tool(
  "get_file_content",
  "Get the content of a specific file from the repository",
  getFileContentSchema.shape,
  getFileContentAnnotations,
  handleGetFileContent
);

export default server;
