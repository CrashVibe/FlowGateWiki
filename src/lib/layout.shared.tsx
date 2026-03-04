import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  branch: "main",
  repo: "FlowGateWiki",
  user: "CrashVibe",
};

export const baseOptions: BaseLayoutProps = {
  githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  nav: {
    title: (
      <div className="flex w-full flex-1 items-center gap-2 py-1.5">
        <Image src="/favicon.ico" className="h-5 w-auto" alt="FlowGate Logo" width={600} height={250} unoptimized />
        <span>FlowGate</span>
      </div>
    ),
  },
};
