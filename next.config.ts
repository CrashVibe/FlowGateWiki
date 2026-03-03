import { createMDX } from "fumadocs-mdx/next";
import type { NextConfig } from "next";

const withMDX = createMDX();

const config: NextConfig = {
  images: {
    qualities: [100],
  },
  reactStrictMode: true,
  rewrites() {
    return [
      {
        destination: "/llms.mdx/docs/:path*",
        source: "/docs/:path*.mdx",
      },
    ];
  },
  serverExternalPackages: ["@takumi-rs/image-response"],
};

export default withMDX(config);
