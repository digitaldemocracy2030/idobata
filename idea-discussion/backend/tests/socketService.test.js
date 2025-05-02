import { jest } from "@jest/globals";
import {
  emitExtractionUpdate,
  emitNewExtraction,
} from "../services/socketService.js";

const mockTo = jest.fn().mockReturnThis();
const mockEmit = jest.fn();

jest.mock("../server.js", () => ({
  io: {
    to: mockTo,
    emit: mockEmit,
  },
}));

describe("Socket Service Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("emitNewExtraction should emit to theme room", () => {
    const themeId = "test-theme-id";
    const threadId = null;
    const type = "problem";
    const data = { statement: "テスト課題", description: "テスト課題の説明" };

    emitNewExtraction(themeId, threadId, type, data);

    expect(mockTo).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(mockEmit).toHaveBeenCalledWith("new-extraction", { type, data });
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

    expect(mockTo).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(mockTo).toHaveBeenCalledWith(`thread:${threadId}`);
    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenCalledWith("new-extraction", { type, data });
  });

  test("emitExtractionUpdate should emit to theme room", () => {
    const themeId = "test-theme-id";
    const threadId = null;
    const type = "problem";
    const data = { statement: "テスト課題", description: "テスト課題の説明" };

    emitExtractionUpdate(themeId, threadId, type, data);

    expect(mockTo).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(mockEmit).toHaveBeenCalledWith("extraction-update", { type, data });
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

    expect(mockTo).toHaveBeenCalledWith(`theme:${themeId}`);
    expect(mockTo).toHaveBeenCalledWith(`thread:${threadId}`);
    expect(mockEmit).toHaveBeenCalledTimes(2);
    expect(mockEmit).toHaveBeenCalledWith("extraction-update", { type, data });
  });
});
