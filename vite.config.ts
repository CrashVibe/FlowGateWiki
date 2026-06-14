import { cloudflare } from "@cloudflare/vite-plugin";
import mdx from "fumadocs-mdx/vite";
import vinext from "vinext";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite"

import * as MdxConfig from "./source.config";

export default defineConfig(() => ({
  optimizeDeps: {
    exclude: ["lucide-react"],
    include: [
      "react",
      "react-dom",
      "next/image.js",
      "next/link.js",
      "tailwind-merge",
      "rehype-raw",
    ],
  },
  plugins: [
    tailwindcss(),
    vinext(),
    mdx(MdxConfig),
    cloudflare({
      viteEnvironment: {
        childEnvironments: ["ssr"],
        name: "rsc",
      },
    }),
  ],
  publicDir: "public",
  resolve: {
    tsconfigPaths: true,
  },
}));
