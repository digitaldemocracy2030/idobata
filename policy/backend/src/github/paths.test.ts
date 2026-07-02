import { describe, expect, it } from "vitest";
import { resolveTargetPath } from "./paths.js";

describe("resolveTargetPath", () => {
  it("returns the path unchanged when no base path is set", () => {
    expect(resolveTargetPath("docs/foo.md", "")).toBe("docs/foo.md");
  });

  it("strips a leading slash", () => {
    expect(resolveTargetPath("/foo.md", "")).toBe("foo.md");
  });

  it("prefixes the base path", () => {
    expect(resolveTargetPath("foo.md", "docs/policies")).toBe(
      "docs/policies/foo.md"
    );
  });

  it("prefixes nested relative paths", () => {
    expect(resolveTargetPath("sub/foo.md", "docs/policies")).toBe(
      "docs/policies/sub/foo.md"
    );
  });

  it("returns the base path itself for an empty relative path", () => {
    expect(resolveTargetPath("", "docs/policies")).toBe("docs/policies");
  });

  it("rejects paths that try to escape via ..", () => {
    expect(() => resolveTargetPath("../secret.md", "docs/policies")).toThrow();
    expect(() =>
      resolveTargetPath("sub/../../secret.md", "docs/policies")
    ).toThrow();
  });
});
