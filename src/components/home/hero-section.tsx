import * as Separator from "@radix-ui/react-separator";

import { Button } from "@/components/button";

export const HeroSection = () => (
  <>
    <section className="flex flex-col items-center gap-6 pt-4 pb-8 text-center md:pt-8 md:pb-16">
      <p className="text-fd-muted-foreground text-xs tracking-widest uppercase">Minecraft Server Chat Bridge</p>

      <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
        FGATE <span className="bg-linear-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Nexus</span>
      </h1>

      <p className="text-fd-muted-foreground max-w-2xl text-lg leading-relaxed sm:text-xl">
        一个现代化的 Minecraft 服务器聊天桥接工具，
        <br className="hidden sm:block" />
        连接你的游戏服务器与聊天平台，轻松管理跨平台消息。
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button href="/docs/core" variant="primary">
          开始使用
        </Button>
        <Button
          href="https://github.com/ZeroCatDev/Flowgate"
          variant="outline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </Button>
      </div>
    </section>

    <Separator.Root className="bg-fd-border/50 mb-12 h-px" />
  </>
);
