import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/").at(-1) ?? "erkezo.termekek";
const basePath = isGitHubPagesBuild ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: isGitHubPagesBuild ? "export" : undefined,
  basePath,
  assetPrefix: basePath,
  trailingSlash: isGitHubPagesBuild,
  images: {
    unoptimized: isGitHubPagesBuild,
  },
  typescript: {
    tsconfigPath: isGitHubPagesBuild
      ? "tsconfig.pages.json"
      : "tsconfig.json",
  },
};

export default nextConfig;
