import type { SiteConfig } from "../types/siteConfig";

export interface PageMeta {
  title: string;
  description: string;
  ogImage?: string;
}

export function generatePageMeta(
  path: string,
  siteConfig: SiteConfig
): PageMeta {
  if (path === "" || path === "/" || path === "/view") {
    return {
      title: siteConfig.siteName,
      description: "市民が集まって対話し、政策を生み出すプラットフォーム",
    };
  }

  const cleanPath = path.replace(/^\/view\//, "").replace(/\/$/, "");

  if (!cleanPath) {
    return {
      title: siteConfig.siteName,
      description: "市民が集まって対話し、政策を生み出すプラットフォーム",
    };
  }

  const pathSegments = cleanPath.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];

  const isFile = lastSegment.includes(".");

  if (isFile) {
    const fileName = lastSegment;
    return {
      title: `${fileName} - ${siteConfig.siteName}`,
      description: `${fileName}の内容を表示しています`,
    };
  }
  const dirName = lastSegment;
  return {
    title: `${dirName} - ${siteConfig.siteName}`,
    description: `${dirName}ディレクトリの内容を表示しています`,
  };
}
