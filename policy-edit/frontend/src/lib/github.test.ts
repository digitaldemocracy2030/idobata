import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GitHubClient,
  type GitHubDirectoryItem,
  type GitHubFile,
} from "./github";

// global.fetch をモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// console.log と console.error をモック
vi.spyOn(console, "log").mockImplementation(() => {});
vi.spyOn(console, "error").mockImplementation(() => {});

describe("GitHubClient", () => {
  let client: GitHubClient;

  beforeEach(() => {
    mockFetch.mockClear();
    vi.clearAllMocks();
    client = new GitHubClient();
  });

  afterEach(() => {});

  describe("fetchContent", () => {
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
        content: "Y29uc29sZS5sb2coImhlbGxvIik7",
        encoding: "base64",
        _links: { self: "", git: "", html: "" },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockFileData,
      });

      const result = await client.fetchContent(owner, repo, path);

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        expect.any(Object)
      );
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockFileData);
      }
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

      const result = await client.fetchContent(owner, repo, "src");

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/contents/src`,
        expect.any(Object)
      );
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(mockDirData);
      }
    });

    it("should include ref in the API URL if provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () =>
          ({ type: "file", content: "", encoding: "base64" }) as GitHubFile,
      });

      const result = await client.fetchContent(owner, repo, path, ref);

      expect(mockFetch).toHaveBeenCalledOnce();
      expect(mockFetch).toHaveBeenCalledWith(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`,
        expect.any(Object)
      );
      expect(result.isOk()).toBe(true);
    });

    it("should return error if owner or repo is missing", async () => {
      const result1 = await client.fetchContent("", repo, path);
      const result2 = await client.fetchContent(owner, "", path);

      expect(result1.isErr()).toBe(true);
      expect(result2.isErr()).toBe(true);
      if (result1.isErr()) {
        expect(result1.error.message).toBe(
          "Repository owner and name are required."
        );
      }
      if (result2.isErr()) {
        expect(result2.error.message).toBe(
          "Repository owner and name are required."
        );
      }
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

      const result = await client.fetchContent(owner, repo, "nonexistent/path");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe(
          "GitHub API error: 404 Not Found - Not Found (Not Found)"
        );
        expect(result.error.status).toBe(404);
      }
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

      const result = await client.fetchContent(owner, repo, path);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toMatch(
          /GitHub API error: 403 Forbidden - API rate limit exceeded.*\(Rate limit exceeded\)/
        );
        expect(result.error.status).toBe(403);
      }
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

      const result = await client.fetchContent(owner, repo, path);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe(
          "GitHub API error: 500 Internal Server Error - Internal Server Error"
        );
        expect(result.error.status).toBe(500);
      }
    });

    it("should handle API errors where response is not JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 502,
        statusText: "Bad Gateway",
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      const result = await client.fetchContent(owner, repo, path);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("GitHub API error: 502 Bad Gateway");
        expect(result.error.status).toBe(502);
      }
    });

    it("should handle network errors during fetch", async () => {
      const networkError = new Error("Network request failed");
      mockFetch.mockRejectedValueOnce(networkError);

      const result = await client.fetchContent(owner, repo, path);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Network request failed");
        expect(result.error.type).toBe("NETWORK_ERROR");
      }
    });
  });

  describe("decodeBase64Content", () => {
    it("should decode a valid Base64 string", () => {
      const base64 = "SGVsbG8gV29ybGQh";
      const expected = "Hello World!";
      const result = client.decodeBase64Content(base64);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(expected);
      }
    });

    it("should handle UTF-8 characters correctly", () => {
      const base64 = "44GT44KT44Gr44Gh44Gv5LiW55WM";
      const expected = "こんにちは世界";
      const result = client.decodeBase64Content(base64);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBe(expected);
      }
    });

    it("should return error for invalid Base64 string", () => {
      const invalidBase64 = "Invalid%%%";
      const result = client.decodeBase64Content(invalidBase64);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Invalid Base64 string");
      }
    });

    it("should return generic error message for other decoding errors", () => {
      const mockDecode = vi.fn().mockImplementation(() => {
        throw new Error("Unexpected decode error");
      });
      const originalTextDecoder = global.TextDecoder;
      global.TextDecoder = vi.fn().mockImplementation(() => ({
        decode: mockDecode,
      })) as unknown as typeof TextDecoder;

      const base64 = "SGVsbG8=";
      const result = client.decodeBase64Content(base64);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Error decoding content");
      }

      global.TextDecoder = originalTextDecoder;
    });
  });
});
