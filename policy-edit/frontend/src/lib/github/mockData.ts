import type { GitHubDirectoryItem, GitHubFile } from "./IGitHubClient";

export const mockDirectoryData: GitHubDirectoryItem[] = [
  {
    name: "README.md",
    path: "README.md",
    sha: "abc123",
    size: 1024,
    url: "https://api.github.com/repos/mock/repo/contents/README.md",
    html_url: "https://github.com/mock/repo/blob/main/README.md",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
    download_url: "https://raw.githubusercontent.com/mock/repo/main/README.md",
    type: "file",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/README.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
      html: "https://github.com/mock/repo/blob/main/README.md",
    },
  },
  {
    name: "src",
    path: "src",
    sha: "def456",
    size: 0,
    url: "https://api.github.com/repos/mock/repo/contents/src",
    html_url: "https://github.com/mock/repo/tree/main/src",
    git_url: "https://api.github.com/repos/mock/repo/git/trees/def456",
    download_url: null,
    type: "dir",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/src",
      git: "https://api.github.com/repos/mock/repo/git/trees/def456",
      html: "https://github.com/mock/repo/tree/main/src",
    },
  },
  {
    name: "package.json",
    path: "package.json",
    sha: "ghi789",
    size: 512,
    url: "https://api.github.com/repos/mock/repo/contents/package.json",
    html_url: "https://github.com/mock/repo/blob/main/package.json",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
    download_url:
      "https://raw.githubusercontent.com/mock/repo/main/package.json",
    type: "file",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/package.json",
      git: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
      html: "https://github.com/mock/repo/blob/main/package.json",
    },
  },
];

export const mockFileContents: Record<string, GitHubFile> = {
  "README.md": {
    name: "README.md",
    path: "README.md",
    sha: "abc123",
    size: 1024,
    url: "https://api.github.com/repos/mock/repo/contents/README.md",
    html_url: "https://github.com/mock/repo/blob/main/README.md",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
    download_url: "https://raw.githubusercontent.com/mock/repo/main/README.md",
    type: "file",
    content: btoa(
      "# Mock Repository\n\nThis is a mock repository for testing purposes.\n\n## Features\n- Mock data\n- Rate limit free\n- Consistent responses"
    ),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/README.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
      html: "https://github.com/mock/repo/blob/main/README.md",
    },
  },
  "package.json": {
    name: "package.json",
    path: "package.json",
    sha: "ghi789",
    size: 512,
    url: "https://api.github.com/repos/mock/repo/contents/package.json",
    html_url: "https://github.com/mock/repo/blob/main/package.json",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
    download_url:
      "https://raw.githubusercontent.com/mock/repo/main/package.json",
    type: "file",
    content: btoa(
      '{\n  "name": "mock-repo",\n  "version": "1.0.0",\n  "description": "Mock repository for testing",\n  "main": "index.js",\n  "scripts": {\n    "test": "echo \\"Error: no test specified\\" && exit 1"\n  }\n}'
    ),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/package.json",
      git: "https://api.github.com/repos/mock/repo/git/blobs/ghi789",
      html: "https://github.com/mock/repo/blob/main/package.json",
    },
  },
  "src/components/Button.tsx": {
    name: "Button.tsx",
    path: "src/components/Button.tsx",
    sha: "jkl012",
    size: 256,
    url: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
    html_url:
      "https://github.com/mock/repo/blob/main/src/components/Button.tsx",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
    download_url:
      "https://raw.githubusercontent.com/mock/repo/main/src/components/Button.tsx",
    type: "file",
    content: btoa(
      "interface ButtonProps {\n  children: React.ReactNode;\n  onClick?: () => void;\n}\n\nexport function Button({ children, onClick }: ButtonProps) {\n  return (\n    <button onClick={onClick}>\n      {children}\n    </button>\n  );\n}"
    ),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
      git: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
      html: "https://github.com/mock/repo/blob/main/src/components/Button.tsx",
    },
  },
};

export const mockDirectoryContents: Record<string, GitHubDirectoryItem[]> = {
  "": mockDirectoryData,
  src: [
    {
      name: "components",
      path: "src/components",
      sha: "mno345",
      size: 0,
      url: "https://api.github.com/repos/mock/repo/contents/src/components",
      html_url: "https://github.com/mock/repo/tree/main/src/components",
      git_url: "https://api.github.com/repos/mock/repo/git/trees/mno345",
      download_url: null,
      type: "dir",
      _links: {
        self: "https://api.github.com/repos/mock/repo/contents/src/components",
        git: "https://api.github.com/repos/mock/repo/git/trees/mno345",
        html: "https://github.com/mock/repo/tree/main/src/components",
      },
    },
    {
      name: "utils",
      path: "src/utils",
      sha: "pqr678",
      size: 0,
      url: "https://api.github.com/repos/mock/repo/contents/src/utils",
      html_url: "https://github.com/mock/repo/tree/main/src/utils",
      git_url: "https://api.github.com/repos/mock/repo/git/trees/pqr678",
      download_url: null,
      type: "dir",
      _links: {
        self: "https://api.github.com/repos/mock/repo/contents/src/utils",
        git: "https://api.github.com/repos/mock/repo/git/trees/pqr678",
        html: "https://github.com/mock/repo/tree/main/src/utils",
      },
    },
  ],
  "src/components": [
    {
      name: "Button.tsx",
      path: "src/components/Button.tsx",
      sha: "jkl012",
      size: 256,
      url: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
      html_url:
        "https://github.com/mock/repo/blob/main/src/components/Button.tsx",
      git_url: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
      download_url:
        "https://raw.githubusercontent.com/mock/repo/main/src/components/Button.tsx",
      type: "file",
      _links: {
        self: "https://api.github.com/repos/mock/repo/contents/src/components/Button.tsx",
        git: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
        html: "https://github.com/mock/repo/blob/main/src/components/Button.tsx",
      },
    },
  ],
};
