import { Button } from "@/components/button";

export const BannerSection = () => (
  <div className="border-fd-border relative mt-4 overflow-hidden rounded-xl border bg-[linear-gradient(var(--color-fd-border)_1px,transparent_1px),linear-gradient(to_right,var(--color-fd-border)_1px,transparent_1px)] bg-size-[48px_48px] py-10 sm:py-16">
    <div className="relative z-1 px-4 text-center">
      <h2 className="from-fd-primary to-fd-foreground/40 bg-linear-to-b bg-clip-text text-2xl font-semibold text-transparent sm:text-3xl">
        简单接入，即刻桥接。
        <br />
        数据在你手中。
      </h2>
      <p className="text-fd-muted-foreground mx-auto mt-3 max-w-md text-sm">
        FGATE Nexus 完全本地运行，无需上云，支持 Windows、Linux、macOS，随时掌控你的服务器与消息。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button href="/docs/core" variant="primary">
          快速开始
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
    </div>
    <div className="absolute inset-0 z-0 [background:radial-gradient(ellipse_at_center,transparent_40%,var(--color-fd-background)_100%)]" />
  </div>
);
