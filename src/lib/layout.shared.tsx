import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared"
import Image from "next/image"

import { appName } from "@/lib/shared"

export const baseOptions: BaseLayoutProps = {
  githubUrl: `https://github.com/CrashVibe/FlowGateWiki`,
  nav: {
    title: (
      <div className="flex w-full flex-1 items-center gap-2 py-1.5">
        <Image
          src="/favicon.ico"
          className="h-5 w-auto"
          alt="FlowGate Logo"
          width={600}
          height={250}
          unoptimized
        />
        <span>{appName}</span>
      </div>
    ),
  },
}
