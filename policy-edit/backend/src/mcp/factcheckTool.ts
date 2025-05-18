import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createFactCheckUseCase } from "../services/factcheck/factcheckFactory.js";
import { logger } from "../utils/logger.js";

export const factcheckSchema = z.object({
  prUrl: z.string().url(),
  credential: z.string(),
});

export function registerFactCheckTool(server: McpServer): void {
  server.tool("factcheck", factcheckSchema.shape, async (params) => {
    try {
      logger.info("Handling factcheck request for PR:", params.prUrl);

      const factCheckUseCase = createFactCheckUseCase();
      const result = await factCheckUseCase.execute(params);

      if (result.success) {
        return {
          content: [
            {
              type: "text",
              text: `ファクトチェックが完了しました。結果はこちらで確認できます: ${result.commentUrl}`,
            },
          ],
        };
      } else {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `ファクトチェックに失敗しました: ${result.error.message}`,
            },
          ],
        };
      }
    } catch (error: any) {
      logger.error("Error in factcheck tool:", error);
      return {
        isError: true,
        content: [
          {
            type: "text",
            text: `ファクトチェック処理中にエラーが発生しました: ${error.message || "不明なエラー"}`,
          },
        ],
      };
    }
  });

  logger.info("Factcheck tool registered");
}
