import { cache } from "react";

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  html_url: string;
  body: string;
}

export interface VersionInfo {
  version: string;
  publishedAt: string;
  url: string;
  releaseNotes: string;
}

/**
 * 获取 GitHub 仓库的最新版本信息
 */
export const getLatestVersion = cache(async (owner: string, repo: string): Promise<VersionInfo> => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "FGateDoc-Fumadocs",
    },
    // 30 分钟缓存
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
  }

  const release: GitHubRelease = await response.json();

  return {
    publishedAt: new Date(release.published_at).toLocaleDateString("zh-CN"),
    releaseNotes: release.body || "",
    url: release.html_url,
    version: release.tag_name,
  };
});

/** 获取 FGateNexus 的版本信息 */
export const getFGateNexusVersion = (): Promise<VersionInfo> => getLatestVersion("CrashVibe", "FGateNexus");

/** 获取 FGateClient 的版本信息 */
export const getFGateClientVersion = (): Promise<VersionInfo> => getLatestVersion("CrashVibe", "FGateClient");
