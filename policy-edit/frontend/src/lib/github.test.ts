import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type GitHubDirectoryItem,
  type GitHubFile,
  decodeBase64Content,
  fetchGitHubContent,
} from "./github";

// global.fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// console.log と console.error をモック
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

describe("github", () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    mockFetch.mockClear();
    vi.clearAllMocks(); // consoleのモックもクリア
  });

  afterEach(() => {
    // モックのリストアは不要 (global.fetch はテスト全体でモックしたまま)
    // console のモックは beforeEach でクリアされる
  });

  describe("fetchGitHubContent", () => {
    const owner = "test-owner";
    const repo = "test-repo";
    const path = "src/file.ts";
    const ref = "main";

    it("should fetch file content successfully", async () => {
      const mockFileData: GitHubFile = {
        name: "file.ts",
        path: "src/file.ts",
        sha: "test-sha",
        size: 123,
        url: "test-url",
        html_url: "test-html-url",
        git_url: "test-git-url",
        download_url: "test-download-url",
        type: "file",
        content: "Y29uc29sZS5sb2coImhlbGxvIik7", // console.log("hello");
        encoding: "base64",
        _links: { self: "", git: "", html: "" },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockFileData,
      });

      const result = await fetchGitHubContent(owner, repo, path);

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        expect.any(Object) // headersなどを含むオブジェクト
      );
      expect(result).toEqual(mockFileData);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Fetching from GitHub API:")
      );
    });

    it("should fetch directory content successfully", async () => {
      const mockDirData: GitHubDirectoryItem[] = [
        {
          name: "file1.ts",
          path: "src/file1.ts",
          sha: "sha1",
          size: 100,
          url: "",
          html_url: "",
          git_url: "",
          download_url: null,
          type: "file",
          _links: { self: "", git: "", html: "" },
        },
        {
          name: "subdir",
          path: "src/subdir",
          sha: "sha2",
          size: 0,
          url: "",
          html_url: "",
          git_url: "",
          download_url: null,
          type: "dir",
          _links: { self: "", git: "", html: "" },
        },
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockDirData,
      });

      const result = await fetchGitHubContent(owner, repo, "src");

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/contents/src`,
        expect.any(Object)
      );
      expect(result).toEqual(mockDirData);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("Fetching from GitHub API:")
      );
    });

    it("should include ref in the API URL if provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          ({ type: "file", content: "", encoding: "base64" }) as GitHubFile, // Minimal valid response
      });

      await fetchGitHubContent(owner, repo, path, ref);

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
        expect.any(Object)
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(`ref=${ref}`)
      );
    });

    it("should throw an error if owner or repo is missing", async () => {
      await expect(fetchGitHubContent("", repo, path)).rejects.toThrow(
        "Repository owner and name are required."
      );
      await expect(fetchGitHubContent(owner, "", path)).rejects.toThrow(
        "Repository owner and name are required."
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle 404 Not Found error", async () => {
      const errorResponse = {
        message: "Not Found",
        documentation_url: "test-doc-url",
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => errorResponse,
      });

      await expect(
        fetchGitHubContent(owner, repo, "nonexistent/path")
      ).rejects.toThrow(
        "GitHub API error: 404 Not Found - Not Found (Not Found)"
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("404 Not Found")
      );
    });

    it("should handle 403 Rate Limit Exceeded error", async () => {
      const errorResponse = {
        message: "API rate limit exceeded for xxx.xxx.xxx.xxx.",
        documentation_url: "test-doc-url",
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: async () => errorResponse,
      });

      await expect(fetchGitHubContent(owner, repo, path)).rejects.toThrow(
        /GitHub API error: 403 Forbidden - API rate limit exceeded.*\(Rate limit exceeded\)/
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("403 Forbidden")
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Rate limit exceeded")
      );
    });

    it("should handle other API errors", async () => {
      const errorResponse = {
        message: "Internal Server Error",
        documentation_url: "test-doc-url",
      };
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => errorResponse,
      });

      await expect(fetchGitHubContent(owner, repo, path)).rejects.toThrow(
        "GitHub API error: 500 Internal Server Error - Internal Server Error"
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("500 Internal Server Error")
      );
    });

    it("should handle API errors where response is not JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        json: async () => {
          throw new Error("Invalid JSON");
        }, // Simulate non-JSON response
      });

      await expect(fetchGitHubContent(owner, repo, path)).rejects.toThrow(
        "GitHub API error: 502 Bad Gateway" // Error message without details
      );
      expect(console.error).toHaveBeenCalledWith(
        "GitHub API error: 502 Bad Gateway"
      );
    });

    it("should handle network errors during fetch", async () => {
      const networkError = new Error("Network request failed");
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(fetchGitHubContent(owner, repo, path)).rejects.toThrow(
        networkError // Should re-throw the original network error
      );
      expect(console.error).toHaveBeenCalledWith(
        "Error fetching GitHub content:",
        networkError
      );
    });
  });

  describe("decodeBase64Content", () => {
    it("should decode a valid Base64 string", () => {
      const base64 = "SGVsbG8gV29ybGQh"; // "Hello World!"
      const expected = "Hello World!";
      expect(decodeBase64Content(base64)).toBe(expected);
    });

    it("should handle UTF-8 characters correctly", () => {
      const base64 = "44GT44KT44Gr44Gh44Gv5LiW55WM";
      const expected = "こんにちは世界";
      expect(decodeBase64Content(base64)).toBe(expected);
    });

    it("should return error message for invalid Base64 string", () => {
      const invalidBase64 = "Invalid%%%";
      const result = decodeBase64Content(invalidBase64);
      expect(result).toMatch(
        /Error: Invalid Base64 string|Error decoding content/
      );
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error decoding Base64 content:"),
        expect.any(Error)
      );
    });

    it("should return generic error message for other decoding errors", () => {
      // Simulate an unexpected error during TextDecoder.decode (hard to trigger directly)
      const mockDecode = vi.fn().mockImplementation(() => {
        throw new Error("Unexpected decode error");
      });
      const originalTextDecoder = global.TextDecoder;
      global.TextDecoder = vi.fn().mockImplementation(() => ({
        decode: mockDecode,
      })) as unknown as typeof TextDecoder;

      const base64 = "SGVsbG8="; // "Hello"
      const result = decodeBase64Content(base64);

      expect(result).toBe("Error decoding content");
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Error decoding Base64 content:"),
        expect.any(Error)
      );

      // Restore original TextDecoder
      global.TextDecoder = originalTextDecoder;
    });
  });
});
