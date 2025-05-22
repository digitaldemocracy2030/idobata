import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";
import {
  GITHUB_REPO_NAME,
  GITHUB_REPO_OWNER,
  OPENROUTER_API_KEY,
} from "../config.js";
import { logger } from "../utils/logger.js";

// Define types for MCP tools and OpenAI tools
interface McpTool {
  name: string;
  description?: string;
  input_schema: Record<string, unknown>;
}

// Add an interface for the raw tool definition from listTools
interface McpToolDefinition {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>; // Assuming this structure based on usage
}

// Convert MCP tools to OpenAI tools format
function convertMcpToolsToOpenAI(
  mcpTools: McpTool[]
): OpenAI.Chat.ChatCompletionTool[] {
  return mcpTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: {
        type: "object",
        properties: tool.input_schema.properties || {},
        required: tool.input_schema.required || [],
      },
    },
  }));
}

// Initialize OpenAI client with OpenRouter base URL
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
});

// MCP Client class
export class McpClient {
  private mcp: Client;
  private transport: StdioClientTransport | null = null;
  private _tools: McpTool[] = [];
  private _initialized = false; // Track initialization status

  // Getter for tools
  get tools(): McpTool[] {
    return this._tools;
  }

  // Getter for initialization status
  get initialized(): boolean {
    return this._initialized;
  }

  constructor() {
    this.mcp = new Client({
      name: "idobata-policy-editor-client",
      version: "1.0.0",
    });
  }

  /**
   * Connect to an MCP server
   * @param serverScriptPath Path to the server script
   */
  async connectToServer(serverScriptPath: string): Promise<void> {
    if (this._initialized) {
      logger.warn("MCP client is already initialized.");
      return;
    }
    try {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");

      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }

      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath; // Use node executable path for .js

      // Prepare the environment for the transport
      const transportEnv: Record<string, string> = Object.entries(
        process.env
      ).reduce(
        (acc, [key, value]) => {
          if (typeof value === "string") {
            acc[key] = value;
          }
          return acc;
        },
        {} as Record<string, string>
      );

      // Validate and add required GitHub variables
      const requiredEnvVars = [
        "GITHUB_APP_ID",
        "GITHUB_INSTALLATION_ID",
        "GITHUB_TARGET_OWNER",
        "GITHUB_TARGET_REPO",
      ];
      for (const key of requiredEnvVars) {
        const value = process.env[key];
        if (typeof value !== "string" || value.trim() === "") {
          // Throw error *before* creating transport if required vars are missing
          throw new Error(
            `Missing or invalid required environment variable: ${key}`
          );
        }
        transportEnv[key] = value; // Add validated variable to the prepared env object
      }

      // Create the transport with the fully prepared environment
      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
        env: transportEnv,
      });

      await this.mcp.connect(this.transport); // Connect might be async

      const toolsResult = await this.mcp.listTools();
      // Cast 'tool' to the defined interface
      this._tools = toolsResult.tools.map((tool: unknown) => {
        // Cast the unknown tool to our defined interface
        const definedTool = tool as McpToolDefinition;
        return {
          name: definedTool.name,
          description: definedTool.description,
          input_schema: definedTool.inputSchema,
        };
      });

      this._initialized = true; // Mark as initialized

      logger.info(
        "Connected to MCP server with tools:",
        this.tools.map(({ name }) => name)
      );
    } catch (e) {
      logger.error("Failed to connect to MCP server:", e);
      this._initialized = false; // Ensure status is false on error
      this.transport = null; // Clear transport on error
      throw e; // Re-throw the error for the caller to handle
    }
  }

  /**
   * Process a user query using Claude via OpenRouter
   * @param query User's query text
   * @param history Conversation history (array of messages)
   * @param branchId The current branch ID associated with the chat (optional)
   * @param fileContent The content of the currently viewed file (optional)
   * @param userName The name of the user initiating the request (optional)
   * @returns Response from the model
   */
  async processQuery(
    query: string,
    history: OpenAI.Chat.ChatCompletionMessageParam[] = [],
    branchId?: string,
    fileContent?: string,
    userName?: string,
    filePath?: string
  ): Promise<string> {
    if (!this._initialized || !this.mcp) {
      return "Error: MCP client is not connected.";
    }

    let targetFilePath = filePath || "";
    let fileSelectionReason = "";
    // Create a local variable to store the content, initialized with the parameter value
    let contentToUse = fileContent;

    // Define messages with proper typing for OpenAI API, starting with the system prompt and history
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `あなたは、ユーザーが政策案の改善提案を作成するのを支援するAIアシスタントです。「現在のファイル内容」として提供された政策文書について、ユーザー（名前：${userName || "不明"}）が改善提案を練り上げるのを手伝うことがあなたの目標です。

政策案は共有オンラインワークスペース（GitHub）で保管・管理されています。あなたのタスクは、改善の可能性についてユーザーと議論し、ファイル内容を変更し、他の人によるレビューのために準備することです。

以下の手順で協力しましょう：
1.  **改善点の議論:** ユーザーが政策改善のアイデアを共有します。これらのアイデアについて、批判的に議論してください。ユーザーの提案に疑問を投げかけ、最終的な変更が強力でよく考慮されたものになるように、その影響をユーザーが考えるのを手伝ってください。提供されたテキストのみを扱ってください。
2.  **下書きの編集:** 具体的な変更点について合意したら、利用可能なツールを使って、これらの変更をあなた専用の下書きスペース（ブランチ）にて、「${targetFilePath}」にあるファイルの新しいバージョン（コミット）として保存します。これはユーザーの個人的な編集作業です。変更点の要約を提示して最終確認を求め、承認を得たら直接変更をコミットします。変更箇所は本当に必要なものだけにしてください。コミットメッセージにはユーザー名（${userName || "不明"}）を含めてください。
    この作業は、ユーザーが望む限り何度でも繰り返せます。
3.  **改善提案の投稿の準備:** 下書きの編集にユーザーが満足したら、改善提案を投稿する準備をします。利用可能なツールを使ってプルリクエストのタイトルと説明を設定してください。ツールで設定するプルリクエストの説明には、行われた改善点、その意図や目的、背景などを可能な限り明確かつ詳細（1000文字以上）に述べ、ユーザー名（${userName || "匿名"}）を記載しましょう。このメッセージは、変更内容とその理由を他の人に伝えるために使われます（プルリクエスト）。
4.  **リンクの共有:** ツールを使ってプルリクエストを更新した後に、提案された変更へのウェブリンク（プルリクエストリンク）をユーザーに提供してください。

注意点：ユーザーは「Git」、「コミット」、「ブランチ」、「プルリクエスト」のような技術用語に詳しくありません。プロセスやあなたが取る行動を説明する際には、シンプルで日常的な言葉を使用してください。提供された政策文書の内容改善にのみ集中しましょう。

${fileSelectionReason ? `【ファイル選択について】: ${fileSelectionReason}` : ""}

返答は最大500文字。`,
      },
      ...history,
    ];

    if (filePath) {
      const fileSelection = await determineTargetFile(query, filePath);
      targetFilePath = fileSelection.targetFilePath;
      fileSelectionReason = fileSelection.reason;

      if (targetFilePath !== filePath) {
        try {
          const octokit = await getAuthenticatedOctokit();
          const owner = GITHUB_REPO_OWNER || "";
          const repo = GITHUB_REPO_NAME || "";

          const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path: targetFilePath,
          });

          if (!Array.isArray(data) && data.type === "file" && data.content) {
            // Update the local variable instead of the parameter
            contentToUse = Buffer.from(data.content, "base64").toString(
              "utf-8"
            );
            messages.push({
              role: "system",
              content: `ファイル内容が更新されました: ${targetFilePath}`,
            });
          }
        } catch (error) {
          logger.error(`Error fetching content for ${targetFilePath}:`, error);
          targetFilePath = filePath;
          fileSelectionReason =
            "選択したファイルの内容取得に失敗したため、現在のファイルを使用します。";
        }
      }
    }

    // Construct and add context message if branchId or contentToUse is available
    let contextContent = "";
    if (branchId) {
      contextContent += `Current Branch ID: ${branchId}\n`;
    }
    if (filePath) {
      contextContent += `Current File Path: ${filePath}\n`;
    }
    if (contentToUse) {
      // Truncate potentially long file content to avoid excessive token usage
      const maxContentLength = 50000; // Adjust as needed
      const truncatedContent =
        contentToUse.length > maxContentLength
          ? `${contentToUse.substring(0, maxContentLength)}\n... (content truncated)`
          : contentToUse;
      contextContent += `\nCurrent File Content:\n\`\`\`\n${truncatedContent}\n\`\`\``;
    }

    if (contextContent) {
      messages.push({
        role: "system", // Use system role for context
        content: contextContent.trim(),
      });
    }

    // Add the current user query *after* the context
    messages.push({
      role: "user",
      content: query,
    });

    try {
      // Convert MCP tools to OpenAI format
      const openaiTools = convertMcpToolsToOpenAI(this.tools);

      const response = await openai.chat.completions.create({
        model: "google/gemini-2.5-pro-preview-03-25",
        messages: messages,
        tools: openaiTools.length > 0 ? openaiTools : undefined, // Only pass tools if available
        tool_choice: openaiTools.length > 0 ? "auto" : undefined, // Only allow tool choice if tools exist
        max_tokens: 50000,
      });

      const finalText: string[] = [];
      const toolResults: unknown[] = [];

      // Process the response content
      if (response.choices && response.choices.length > 0) {
        const message = response.choices[0].message;

        // Handle text content
        if (message.content) {
          finalText.push(message.content);
        }

        // Handle tool calls
        if (message.tool_calls && message.tool_calls.length > 0) {
          // Add the assistant's message with tool calls to history
          messages.push({
            role: "assistant",
            content: message.content, // Include any text content alongside tool calls
            tool_calls: message.tool_calls,
          });

          for (const toolCall of message.tool_calls) {
            const toolName = toolCall.function.name;
            let toolArgs = {};
            try {
              toolArgs = JSON.parse(toolCall.function.arguments);
            } catch (parseError) {
              logger.error(
                `Failed to parse arguments for tool ${toolName}:`,
                parseError
              );
              // Add an error message for this specific tool call
              messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                // name: toolName, // Removed invalid 'name' property
                content: `Error: Invalid arguments format. ${parseError instanceof Error ? parseError.message : "Unknown parsing error"}`,
              });
              continue; // Skip to the next tool call
            }

            logger.debug(`Calling tool ${toolName} with args:`, toolArgs);

            try {
              const result = await this.mcp.callTool({
                name: toolName,
                arguments: toolArgs,
              });

              toolResults.push(result);
              // Add the tool result to messages for follow-up
              messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                // name: toolName, // Removed invalid 'name' property
                content: JSON.stringify(result.content || result), // Send back content or the whole result
              });
            } catch (toolError) {
              logger.error(`Error calling tool ${toolName}:`, toolError);
              messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                // name: toolName, // Removed invalid 'name' property
                content: `Error executing tool: ${toolError instanceof Error ? toolError.message : "Unknown tool error"}`,
              });
            }
          }

          // Get a follow-up response from the model after processing all tool calls
          const followUpResponse = await openai.chat.completions.create({
            model: "google/gemini-2.5-pro-preview-03-25",
            messages: messages, // Send updated history including tool results/errors
            max_tokens: 50000,
          });

          if (followUpResponse.choices && followUpResponse.choices.length > 0) {
            finalText.push(followUpResponse.choices[0].message.content || "");
          }
        }
      }

      // If finalText is empty after processing, return a default message
      if (finalText.length === 0 || finalText.every((t) => t.trim() === "")) {
        return "I received the request but didn't generate a text response.";
      }

      return finalText.join("\n").trim();
    } catch (error) {
      logger.error("Error processing query:", error);
      return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.mcp && this._initialized) {
      try {
        await this.mcp.close();
        logger.info("MCP client connection closed.");
      } catch (error) {
        logger.error("Error closing MCP client connection:", error);
      } finally {
        this._initialized = false;
        this.transport = null;
        this._tools = [];
      }
    }
  }
}

async function getAuthenticatedOctokit(): Promise<{
  rest: {
    repos: {
      getContent: (params: {
        owner: string;
        repo: string;
        path: string;
      }) => Promise<{
        data:
          | { type: string; path: string; content?: string }
          | Array<{ type: string; path: string; content?: string }>;
      }>;
    };
  };
}> {
  try {
    const { Octokit } = await import("@octokit/rest");
    const octokit = new Octokit();
    return octokit;
  } catch (error) {
    logger.error("Failed to create Octokit instance:", error);
    throw error;
  }
}

async function getRepositoryFiles(): Promise<string[]> {
  const octokit = await getAuthenticatedOctokit();
  const owner = GITHUB_REPO_OWNER || "";
  const repo = GITHUB_REPO_NAME || "";

  if (!owner || !repo) {
    logger.error("GitHub repository settings are not configured.");
    return [];
  }

  try {
    async function getFilesRecursively(path = ""): Promise<string[]> {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      let files: string[] = [];

      for (const item of Array.isArray(data) ? data : [data]) {
        if (item.type === "file" && item.path.endsWith(".md")) {
          files.push(item.path);
        } else if (item.type === "dir") {
          const subFiles = await getFilesRecursively(item.path);
          files = [...files, ...subFiles];
        }
      }

      return files;
    }

    return getFilesRecursively();
  } catch (error) {
    logger.error("Failed to get repository files:", error);
    return [];
  }
}

function parseRulesFile(
  content: string
): Array<{ keywords: string[]; filePath: string }> {
  const rules: Array<{ keywords: string[]; filePath: string }> = [];
  const lines = content.split("\n");

  for (const line of lines) {
    if (line.trim().startsWith("#") || line.trim() === "") continue;

    const match = line.match(/^(.*?):\s*(.*)$/);
    if (match) {
      const keywords = match[1].split(",").map((k) => k.trim());
      const filePath = match[2].trim();
      rules.push({ keywords, filePath });
    }
  }

  return rules;
}

async function selectFileByName(
  query: string,
  existingFiles: string[],
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  const prompt = `
あなたは政策提案の内容を分析し、最も適切なファイルを選択するアシスタントです。
以下の変更提案を分析し、ファイル名だけを見て、どのファイルに適用するのが最も適切か判断してください。

【ユーザーの変更提案】
${query}

【利用可能なファイル一覧】
${existingFiles.join("\n")}

【現在表示中のファイル】
${currentFilePath}

以下の形式で回答してください：
ファイルパス: [選択したファイルのパス]
理由: [選択理由の説明]
`;

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-preview-03-25",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || "";
    const filePathMatch = content.match(/ファイルパス:\s*(.+)/);
    const reasonMatch = content.match(/理由:\s*(.+)/);

    const targetFilePath = filePathMatch
      ? filePathMatch[1].trim()
      : currentFilePath;
    const reason = reasonMatch
      ? `${reasonMatch[1].trim()}（ファイル名のみから判断しました）`
      : "ファイル名から最適なファイルを判断しました";

    if (!existingFiles.includes(targetFilePath)) {
      logger.warn(
        `Selected file ${targetFilePath} does not exist, using current file path`
      );
      return {
        targetFilePath: currentFilePath,
        reason: `選択されたファイル ${targetFilePath} が存在しないため、現在のファイルを使用します。`,
      };
    }

    return { targetFilePath, reason };
  } catch (error) {
    logger.error("Error in selectFileByName:", error);
    return {
      targetFilePath: currentFilePath,
      reason:
        "ファイル選択中にエラーが発生したため、現在のファイルを使用します。",
    };
  }
}

async function callLLMForFileSelection(
  query: string,
  rules: Array<{ keywords: string[]; filePath: string }>,
  existingFiles: string[],
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  const prompt = `
あなたは政策提案の内容を分析し、最も適切なファイルを選択するアシスタントです。
以下の変更提案を分析し、どのファイルに適用するのが最も適切か判断してください。

【ユーザーの変更提案】
${query}

【利用可能なファイル一覧】
${existingFiles.join("\n")}

【ファイル選択ルール】
${rules.map((r) => `- キーワード [${r.keywords.join(", ")}] => ${r.filePath}`).join("\n")}

【現在表示中のファイル】
${currentFilePath}

以下の形式で回答してください：
ファイルパス: [選択したファイルのパス]
理由: [選択理由の説明]
`;

  try {
    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-pro-preview-03-25",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content || "";
    const filePathMatch = content.match(/ファイルパス:\s*(.+)/);
    const reasonMatch = content.match(/理由:\s*(.+)/);

    const targetFilePath = filePathMatch
      ? filePathMatch[1].trim()
      : currentFilePath;
    const reason = reasonMatch
      ? `${reasonMatch[1].trim()}（リポジトリのルールファイルに基づいて判断しました）`
      : "リポジトリのルールファイルに基づいて最適なファイルを判断しました";

    if (!existingFiles.includes(targetFilePath)) {
      logger.warn(
        `Selected file ${targetFilePath} does not exist, using current file path`
      );
      return {
        targetFilePath: currentFilePath,
        reason: `選択されたファイル ${targetFilePath} が存在しないため、現在のファイルを使用します。`,
      };
    }

    return { targetFilePath, reason };
  } catch (error) {
    logger.error("Error in callLLMForFileSelection:", error);
    return {
      targetFilePath: currentFilePath,
      reason:
        "ファイル選択中にエラーが発生したため、現在のファイルを使用します。",
    };
  }
}

async function determineTargetFile(
  query: string,
  currentFilePath: string
): Promise<{ targetFilePath: string; reason: string }> {
  try {
    const octokit = await getAuthenticatedOctokit();
    const owner = GITHUB_REPO_OWNER || "";
    const repo = GITHUB_REPO_NAME || "";
    const rulesFilePath = ".meta/target_file_rules.txt";

    let rules: Array<{ keywords: string[]; filePath: string }> = [];
    let rulesSource = "filename"; // デフォルトはファイル名のみから判定

    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: rulesFilePath,
      });

      if (!Array.isArray(data) && data.type === "file" && data.content) {
        const rulesContent = Buffer.from(data.content, "base64").toString(
          "utf-8"
        );
        rules = parseRulesFile(rulesContent);
        rulesSource = "rules";
        logger.info(`Successfully loaded rules from ${rulesFilePath}`);
      }
    } catch (error) {
      logger.warn(
        `Rules file not found at ${rulesFilePath}, will use filename-based selection`
      );
    }

    const existingFiles = await getRepositoryFiles();

    if (existingFiles.length === 0) {
      logger.warn(
        "No .md files found in the repository, using current file path"
      );
      return {
        targetFilePath: currentFilePath,
        reason:
          "リポジトリ内に.mdファイルが見つからないため、現在のファイルを使用します。",
      };
    }

    if (rulesSource === "rules" && rules.length > 0) {
      return await callLLMForFileSelection(
        query,
        rules,
        existingFiles,
        currentFilePath
      );
    }
    return await selectFileByName(query, existingFiles, currentFilePath);
  } catch (error) {
    logger.error("Error determining target file:", error);
    return {
      targetFilePath: currentFilePath,
      reason:
        "ファイル選択中にエラーが発生したため、現在のファイルを使用します。",
    };
  }
}
