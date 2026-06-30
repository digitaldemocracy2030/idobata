import { Result, err, ok } from "neverthrow";
import { ToolExecutionError } from "../types/errors.js";
import { logger } from "../utils/logger.js";
import { handleUpdatePr, updatePrInputSchema } from "./updatePr.js";
import { handleUpsertFile, upsertFileInputSchema } from "./upsertFile.js";

interface ToolDefinition {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

const tools: ToolDefinition[] = [
  {
    name: "upsert_file_and_commit",
    description:
      "Creates or updates a specified Markdown file in a branch and commits the changes. Automatically creates the branch and a draft pull request if they don't exist.",
    input_schema: upsertFileInputSchema,
    execute: handleUpsertFile,
  },
  {
    name: "update_pr",
    description:
      "Updates the title and/or description (body) of the open pull request associated with the specified branch.",
    input_schema: updatePrInputSchema,
    execute: handleUpdatePr,
  },
];

export interface ToolInfo {
  name: string;
  description: string;
  input_schema: Record<string, unknown>;
}

export function getToolDefinitions(): ToolInfo[] {
  return tools.map(({ name, description, input_schema }) => ({
    name,
    description,
    input_schema,
  }));
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>
): Promise<Result<string, ToolExecutionError>> {
  const tool = tools.find((t) => t.name === name);
  if (!tool) {
    return err(new ToolExecutionError(`Unknown tool: ${name}`));
  }

  try {
    const result = await tool.execute(args);
    return ok(result);
  } catch (error) {
    logger.error(`Error executing tool ${name}:`, error);
    return err(
      new ToolExecutionError(
        `Failed to call tool ${name}: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    );
  }
}
