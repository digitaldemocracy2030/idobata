import { Octokit } from "@octokit/rest";
import OpenAI from "openai";
import { logger } from "../../utils/logger.js";
import { formatFactCheckResult } from "./resultFormatter.js";
import {
  FactCheckAnalysis,
  FactCheckDetail,
  FactCheckErrorResult,
  FactCheckParams,
  FactCheckResult,
  PrDiff,
  PrInfo,
} from "./types.js";

export class FactCheckUseCase {
  constructor(
    private readonly octokit: Octokit,
    private readonly openaiClient: OpenAI,
    private readonly validCredential: string,
    private readonly logger: {
      error: (message: string, ...args: unknown[]) => void;
      info: (message: string, ...args: unknown[]) => void;
    }
  ) {}

  public async execute(
    params: FactCheckParams
  ): Promise<FactCheckResult | FactCheckErrorResult> {
    try {
      await this.validateCredential(params.credential);

      const prInfo = this.validateAndParsePrUrl(params.prUrl);

      const prDiff = await this.fetchPrDiff(prInfo);

      const factCheckResult = await this.performFactCheck(prDiff);

      const commentUrl = await this.postComment(prInfo, factCheckResult);

      return {
        success: true,
        commentUrl,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async validateCredential(credential: string): Promise<void> {
    if (credential !== this.validCredential) {
      throw new FactCheckError(
        "AUTHENTICATION_FAILED",
        "認証に失敗しました。有効な認証情報を指定してください。"
      );
    }
  }

  private validateAndParsePrUrl(prUrl: string): PrInfo {
    const prRegex = /^https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)$/;
    const match = prUrl.match(prRegex);

    if (!match) {
      throw new FactCheckError(
        "INVALID_PR_URL",
        "PRのURLが正しくありません。'https://github.com/owner/repo/pull/数字' の形式で指定してください。"
      );
    }

    return {
      owner: match[1],
      repo: match[2],
      prNumber: Number.parseInt(match[3], 10),
    };
  }

  private async fetchPrDiff(prInfo: PrInfo): Promise<PrDiff> {
    try {
      const { data: pr } = await this.octokit.pulls.get({
        owner: prInfo.owner,
        repo: prInfo.repo,
        pull_number: prInfo.prNumber,
      });

      const diffResponse = await this.octokit.request(
        "GET /repos/{owner}/{repo}/pulls/{pull_number}",
        {
          owner: prInfo.owner,
          repo: prInfo.repo,
          pull_number: prInfo.prNumber,
          headers: {
            accept: "application/vnd.github.diff",
          },
        }
      );

      return {
        title: pr.title,
        description: pr.body || "",
        changes:
          typeof diffResponse.data === "string"
            ? diffResponse.data
            : JSON.stringify(diffResponse.data),
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 404
      ) {
        throw new FactCheckError(
          "PR_NOT_FOUND",
          "指定されたPRが見つかりませんでした。PRが存在するか、アクセス権があるか確認してください。"
        );
      }
      throw error;
    }
  }

  private async performFactCheck(prDiff: PrDiff): Promise<FactCheckAnalysis> {
    try {
      type SystemMessage = { role: "system"; content: string };
      type UserMessage = { role: "user"; content: string };
      type AssistantMessage = {
        role: "assistant";
        content: string;
        tool_calls?: Array<{
          id: string;
          type: "function";
          function: {
            name: string;
            arguments: string;
          };
        }>;
      };
      type ToolMessage = {
        role: "tool";
        tool_call_id: string;
        content: string;
      };

      type Message =
        | SystemMessage
        | UserMessage
        | AssistantMessage
        | ToolMessage;

      const initialMessages: Array<SystemMessage | UserMessage> = [
        {
          role: "system",
          content: `あなたは政策文書のファクトチェックを行う専門家です。以下の政策変更提案（PR）の差分を分析し、事実と異なる記述や誤解を招く表現を特定してください。
          インターネット検索を活用して、最新の情報や統計データと照らし合わせて検証を行ってください。
          結果は以下の形式で返してください：

          1. 概要：主な問題点の要約
          2. 詳細分析：各問題点について、元の記述、事実確認結果、正しい情報、参考情報源を明記
          3. 結論：全体的な評価

          マークダウン形式で返答し、事実と異なる箇所を明確にハイライトしてください。`,
        },
        {
          role: "user",
          content: `以下のPR差分をファクトチェックしてください：

          タイトル: ${prDiff.title}

          説明:
          ${prDiff.description}

          変更内容:
          \`\`\`diff
          ${prDiff.changes}
          \`\`\``,
        },
      ];

      const response = await this.openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: initialMessages as OpenAI.Chat.ChatCompletionMessageParam[],
        temperature: 0.7,
        max_tokens: 4000,
        tools: [
          {
            type: "function",
            function: {
              name: "web_search",
              description: "Search the web for current information",
              parameters: {
                type: "object",
                properties: {
                  query: {
                    type: "string",
                    description: "The search query",
                  },
                },
                required: ["query"],
              },
            },
          },
        ],
        tool_choice: "auto",
      });

      this.logger.info(
        "Initial response received:",
        response.choices[0]?.message
      );

      const content = response.choices[0]?.message?.content;
      if (content && content.trim() !== "") {
        return this.parseFactCheckResponse(content);
      }

      const toolCalls = response.choices[0]?.message?.tool_calls;
      if (toolCalls && toolCalls.length > 0) {
        this.logger.info("Processing tool calls...");
        const messages: Message[] = [...initialMessages];

        messages.push({
          role: "assistant",
          content: response.choices[0].message.content || "",
          tool_calls: toolCalls,
        } as AssistantMessage);

        for (const toolCall of toolCalls) {
          if (toolCall.function.name === "web_search") {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              const query = args.query;

              this.logger.info(`Processing web_search for query: ${query}`);

              const searchResult = `検索結果: "${query}"に関する情報です。これはモックの検索結果です。実際の実装では、ここで本物の検索結果が返されます。`;

              messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                content: searchResult,
              } as ToolMessage);
            } catch (error) {
              this.logger.error("Error processing tool call:", error);
              messages.push({
                tool_call_id: toolCall.id,
                role: "tool",
                content: "検索処理中にエラーが発生しました。",
              } as ToolMessage);
            }
          }
        }

        this.logger.info("Sending follow-up request with tool results...");
        const followUpResponse =
          await this.openaiClient.chat.completions.create({
            model: "gpt-4o",
            messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
            temperature: 0.7,
            max_tokens: 4000,
          });

        const followUpContent = followUpResponse.choices[0]?.message?.content;
        if (!followUpContent) {
          throw new FactCheckError(
            "LLM_API_ERROR",
            "ファクトチェック結果の取得に失敗しました。"
          );
        }

        return this.parseFactCheckResponse(followUpContent);
      }

      throw new FactCheckError(
        "LLM_API_ERROR",
        "ファクトチェック結果の取得に失敗しました。"
      );
    } catch (error: unknown) {
      this.logger.error("Error performing fact check:", error);
      throw new FactCheckError(
        "LLM_API_ERROR",
        "ファクトチェック処理中にエラーが発生しました。しばらく経ってから再試行してください。"
      );
    }
  }

  private parseFactCheckResponse(content: string): FactCheckAnalysis {
    let summary = "";
    const details: FactCheckDetail[] = [];
    let conclusion = "";

    const summaryMatch = content.match(
      /(?:^|\n)(?:##?\s*)?(?:概要|[1１]\.\s*概要)[\s\n:]*([\s\S]*?)(?:\n##|\n\d\.|\n$)/i
    );
    if (summaryMatch?.[1]) {
      summary = summaryMatch[1].trim();
    }

    const conclusionMatch = content.match(
      /(?:^|\n)(?:##?\s*)?(?:結論|[3３]\.\s*結論)[\s\n:]*([\s\S]*?)(?:\n##|\n\d\.|\n$)/i
    );
    if (conclusionMatch?.[1]) {
      conclusion = conclusionMatch[1].trim();
    }

    const detailsSection = content.match(
      /(?:^|\n)(?:##?\s*)?(?:詳細分析|[2２]\.\s*詳細分析)([\s\S]*?)(?:\n##|\n[3３]\.|\n$)/i
    );

    if (detailsSection?.[1]) {
      const topicMatches = detailsSection[1].matchAll(
        /(?:\n###\s*([^\n]+)|\n\d+\.\s*([^\n]+))[\s\S]*?(?=\n###|\n\d+\.|\n##|\n$)/g
      );

      for (const match of topicMatches) {
        const topic = (match[1] || match[2]).trim();
        const section = match[0];

        const claimMatch = section.match(/>\s*([^\n]+)/);
        const claim = claimMatch ? claimMatch[1].trim() : "";

        const isFactual =
          !section.includes("不正確") && !section.includes("誤り");

        const correctionMatch = section.match(
          /事実確認[^\n]*[：:]\s*(?:[^\n]*不正確[^\n]*|[^\n]*正確[^\n]*)。\s*([^\n]+)/
        );
        const correction = correctionMatch ? correctionMatch[1].trim() : "";

        const sources = [];
        const sourceMatches = section.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);

        for (const sourceMatch of sourceMatches) {
          sources.push({
            title: sourceMatch[1].trim(),
            url: sourceMatch[2].trim(),
          });
        }

        details.push({
          topic,
          claim,
          isFactual,
          correction,
          sources: sources.length > 0 ? sources : undefined,
        });
      }
    }

    if (!summary && !details.length && !conclusion) {
      return {
        summary:
          "ファクトチェック結果の解析に失敗しました。以下が生のレスポンスです。",
        details: [
          {
            topic: "LLMレスポンス",
            claim: "解析不能なレスポンス",
            isFactual: false,
            correction: content,
          },
        ],
        conclusion:
          "結果を正確に解析できませんでした。レスポンス全体を確認してください。",
      };
    }

    return {
      summary: summary || "概要なし",
      details:
        details.length > 0
          ? details
          : [
              {
                topic: "分析なし",
                claim: "",
                isFactual: true,
                correction: "詳細な分析は実施されませんでした。",
              },
            ],
      conclusion: conclusion || "結論なし",
    };
  }

  private async postComment(
    prInfo: PrInfo,
    result: FactCheckAnalysis
  ): Promise<string> {
    try {
      const commentBody = formatFactCheckResult(result);

      const { data: comment } = await this.octokit.issues.createComment({
        owner: prInfo.owner,
        repo: prInfo.repo,
        issue_number: prInfo.prNumber,
        body: commentBody,
      });

      return comment.html_url;
    } catch (error: unknown) {
      this.logger.error("Error posting comment:", error);
      throw new FactCheckError(
        "COMMENT_FAILED",
        "ファクトチェック結果の投稿に失敗しました。GitHubの権限設定を確認してください。"
      );
    }
  }

  private handleError(error: unknown): FactCheckErrorResult {
    if (error instanceof FactCheckError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    this.logger.error("Unexpected error in FactCheckUseCase:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "予期しないエラーが発生しました。",
      },
    };
  }
}

class FactCheckError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "FactCheckError";
  }
}
