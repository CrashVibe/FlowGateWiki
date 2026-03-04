import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";

import "./global.css";
import { Inter } from "next/font/google";

import SearchDialog from "@/components/search";

const inter = Inter({
  subsets: ["latin"],
});

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className={inter.className} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <RootProvider
          search={{
            SearchDialog,
          }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}

const metaTitle = "FlowGate 文档 - 跨平台的 Minecraft 服务器聊天桥接工具";

export const metadata: Metadata = {
  creator: "@CrashVibe Team",
  keywords: `FGATE Nexus,
Minecraft Chat Bridge,
Minecraft 服务器聊天桥接，
Minecraft QQ 同步，
Minecraft OneBot,
Minecraft 多服务器管理，
Minecraft 消息同步，
Minecraft 远程命令执行，
Nuxt 4 项目，
开源 Minecraft 管理系统`,
  openGraph: {
    siteName: "FlowGate 文档",
    type: "website",
  },
  title: { default: metaTitle, template: "%s | FlowGate" },
};
