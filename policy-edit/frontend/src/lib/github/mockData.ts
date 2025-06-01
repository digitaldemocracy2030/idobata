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
    name: "snacktime-policy.md",
    path: "snacktime-policy.md",
    sha: "def456",
    size: 512,
    url: "https://api.github.com/repos/mock/repo/contents/snacktime-policy.md",
    html_url: "https://github.com/mock/repo/blob/main/snacktime-policy.md",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/def456",
    download_url:
      "https://raw.githubusercontent.com/mock/repo/main/snacktime-policy.md",
    type: "file",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/snacktime-policy.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/def456",
      html: "https://github.com/mock/repo/blob/main/snacktime-policy.md",
    },
  },
  {
    name: "rest_guidelines",
    path: "rest_guidelines",
    sha: "ghi789",
    size: 0,
    url: "https://api.github.com/repos/mock/repo/contents/rest_guidelines",
    html_url: "https://github.com/mock/repo/tree/main/rest_guidelines",
    git_url: "https://api.github.com/repos/mock/repo/git/trees/ghi789",
    download_url: null,
    type: "dir",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/rest_guidelines",
      git: "https://api.github.com/repos/mock/repo/git/trees/ghi789",
      html: "https://github.com/mock/repo/tree/main/rest_guidelines",
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
      unescape(
        encodeURIComponent(
          "# :cherry_blossom: ほのぼの区政策室\n\nここは架空の行政機関「ほのぼの区政策室」の公開ポリシーレポジトリです。\n\n## :dart: 目的\n日々の生活を、ほんのすこしやさしく、のんびりさせるためのルールや方針を策定・公開しています。\nどれもフィクションで、あくまで実験的・ユーモラスな方針です。\n\n## :card_file_box: ファイル構成\n\n- `snacktime-policy.md`: 区全体向けのおやつ時間に関する方針\n- `rest_guidelines/naptime-recommendation.md`: お昼寝推奨に関する基本方針\n\n## :raised_hands: 貢献方法\nPull Requestでの修正提案、Botとの対話を通じた改善提案を歓迎します。"
        )
      )
    ),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/README.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/abc123",
      html: "https://github.com/mock/repo/blob/main/README.md",
    },
  },
  "snacktime-policy.md": {
    name: "snacktime-policy.md",
    path: "snacktime-policy.md",
    sha: "def456",
    size: 512,
    url: "https://api.github.com/repos/mock/repo/contents/snacktime-policy.md",
    html_url: "https://github.com/mock/repo/blob/main/snacktime-policy.md",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/def456",
    download_url:
      "https://raw.githubusercontent.com/mock/repo/main/snacktime-policy.md",
    type: "file",
    content: btoa(
      unescape(
        encodeURIComponent(
          "# :cookie: ほのぼの区 おやつ時間基本方針\n\n## 第1条: おやつ時間の推奨\n区民は、毎日15:00〜15:20の間に、無理のない範囲でおやつを摂取することが推奨される。\n\n## 第2条: おやつ選定の自由\nおやつの種類は自由とし、和洋問わず尊重される。煎餅、マカロン、昆布なども含まれる。\n\n## 第3条: 共有推奨\n可能な範囲で、隣人・同僚とのおやつのシェアが望ましいが、強制してはならない。"
        )
      )
    ),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/snacktime-policy.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/def456",
      html: "https://github.com/mock/repo/blob/main/snacktime-policy.md",
    },
  },
  "rest_guidelines/naptime-recommendation.md": {
    name: "naptime-recommendation.md",
    path: "rest_guidelines/naptime-recommendation.md",
    sha: "jkl012",
    size: 768,
    url: "https://api.github.com/repos/mock/repo/contents/rest_guidelines/naptime-recommendation.md",
    html_url:
      "https://github.com/mock/repo/blob/main/rest_guidelines/naptime-recommendation.md",
    git_url: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
    download_url:
      "https://raw.githubusercontent.com/mock/repo/main/rest_guidelines/naptime-recommendation.md",
    type: "file",
    content: btoa(
      unescape(
        encodeURIComponent(
          "# :zzz: お昼寝推奨に関する基本方針\n\n## 第1条: 昼寝の推奨時間帯\nほのぼの区では、午後13:00〜14:00の間を「昼休憩時間帯」と定義し、この時間内での軽い昼寝を推奨する。\n\n## 第2条: 昼寝場所の工夫\n職場・自宅・公共施設などにおける昼寝のためのスペース確保に努める。ハンモック、クッション、こたつなど、柔軟な設置が望ましい。\n\n## 第3条: 昼寝の自由\n昼寝をするかどうかは各自の判断に委ねられるものとし、**「昼寝しない自由」**も等しく尊重される。\n\n## 第4条: 昼寝後のリフレッシュ奨励\n目覚めた後は、深呼吸、軽ストレッチ、水分補給などを行い、心身の再起動を円滑に行うことが望ましい。"
        )
      )
    ),
    encoding: "base64",
    _links: {
      self: "https://api.github.com/repos/mock/repo/contents/rest_guidelines/naptime-recommendation.md",
      git: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
      html: "https://github.com/mock/repo/blob/main/rest_guidelines/naptime-recommendation.md",
    },
  },
};

export const mockDirectoryContents: Record<string, GitHubDirectoryItem[]> = {
  "": mockDirectoryData,
  rest_guidelines: [
    {
      name: "naptime-recommendation.md",
      path: "rest_guidelines/naptime-recommendation.md",
      sha: "jkl012",
      size: 768,
      url: "https://api.github.com/repos/mock/repo/contents/rest_guidelines/naptime-recommendation.md",
      html_url:
        "https://github.com/mock/repo/blob/main/rest_guidelines/naptime-recommendation.md",
      git_url: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
      download_url:
        "https://raw.githubusercontent.com/mock/repo/main/rest_guidelines/naptime-recommendation.md",
      type: "file",
      _links: {
        self: "https://api.github.com/repos/mock/repo/contents/rest_guidelines/naptime-recommendation.md",
        git: "https://api.github.com/repos/mock/repo/git/blobs/jkl012",
        html: "https://github.com/mock/repo/blob/main/rest_guidelines/naptime-recommendation.md",
      },
    },
  ],
};
