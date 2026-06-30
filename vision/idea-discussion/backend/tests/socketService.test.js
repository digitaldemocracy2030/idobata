import { beforeEach, describe, expect, test, vi } from "vitest";

// Mock the server.js module
vi.mock("../server.js", () => ({
  io: {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
  },
}));

// Import after mocking
import { io } from "../server.js";
import {
  emitExtractionUpdate,
  emitNewExtraction,
} from "../services/socketService.js";

describe("Socket Service Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("emitNewExtraction should emit to theme room", () => {
    const themeId = "test-theme-id";
    const threadId = null;
    const type = "problem";
    const data = { statement: "テスト課題", description: "テスト課題の説明" };

    emitNewExtraction(themeId, threadId, type, data);

    expect(io.to).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(io.emit).toHaveBeenCalledWith("new-extraction", { type, data });
  });

  test("emitNewExtraction should emit to theme and thread rooms", () => {
    const themeId = "test-theme-id";
    const threadId = "test-thread-id";
    const type = "solution";
    const data = {
      statement: "テスト解決策",
      description: "テスト解決策の説明",
    };

    emitNewExtraction(themeId, threadId, type, data);

    expect(io.to).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(io.to).toHaveBeenCalledWith(`thread:${threadId}`);
    expect(io.emit).toHaveBeenCalledTimes(2);
    expect(io.emit).toHaveBeenCalledWith("new-extraction", { type, data });
  });

  test("emitExtractionUpdate should emit to theme room", () => {
    const themeId = "test-theme-id";
    const threadId = null;
    const type = "problem";
    const data = { statement: "テスト課題", description: "テスト課題の説明" };

    emitExtractionUpdate(themeId, threadId, type, data);

    expect(io.to).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(io.emit).toHaveBeenCalledWith("extraction-update", { type, data });
  });

  test("emitExtractionUpdate should emit to theme and thread rooms", () => {
    const themeId = "test-theme-id";
    const threadId = "test-thread-id";
    const type = "solution";
    const data = {
      statement: "テスト解決策",
      description: "テスト解決策の説明",
    };

    emitExtractionUpdate(themeId, threadId, type, data);

    expect(io.to).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(io.to).toHaveBeenCalledWith(`thread:${threadId}`);
    expect(io.emit).toHaveBeenCalledTimes(2);
    expect(io.emit).toHaveBeenCalledWith("extraction-update", { type, data });
  });
});
