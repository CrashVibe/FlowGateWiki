"use client";

import * as Tabs from "@radix-ui/react-tabs";
import * as Tooltip from "@radix-ui/react-tooltip";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import { useState } from "react";

import preview1 from "@/app/assets/preview/1.webp";
import preview2 from "@/app/assets/preview/2.webp";
import { cn } from "@/lib/cn";

const windowDots = [
  { color: "bg-red-400/70", label: "关闭" },
  { color: "bg-yellow-400/70", label: "最小化" },
  { color: "bg-green-400/70", label: "最大化" },
];

const previews = [
  { label: "主界面", src: preview1, value: "1" },
  { label: "配置页", src: preview2, value: "2" },
];

export const PreviewSection = () => {
  const [active, setActive] = useState(previews[0].value);
  const idx = previews.findIndex((p) => p.value === active);

  return (
    <Tooltip.Provider delayDuration={300}>
      <section className="relative mb-12">
        <div className="pointer-events-none absolute -inset-8 bg-linear-to-b from-blue-500/10 via-cyan-400/5 to-transparent blur-3xl" />

        <Tabs.Root
          value={active}
          onValueChange={setActive}
          className="border-fd-border relative z-10 overflow-hidden rounded-xl border shadow-2xl shadow-black/10"
        >
          <div className="border-fd-border bg-fd-card flex items-center gap-3 border-b px-4 py-3">
            <div className="flex shrink-0 items-center gap-1.5">
              {windowDots.map(({ color, label }) => (
                <Tooltip.Root key={label}>
                  <Tooltip.Trigger asChild>
                    <span className={cn("h-2.5 w-2.5 cursor-default rounded-full", color)} />
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="bottom"
                      sideOffset={6}
                      className="bg-fd-popover text-fd-popover-foreground rounded-md px-2 py-1 text-[11px] shadow-md"
                    >
                      {label}
                      <Tooltip.Arrow className="fill-fd-popover" />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              ))}
            </div>

            <Tabs.List className="ml-2 flex gap-1" aria-label="预览图切换">
              <VisuallyHidden.Root>切换预览图</VisuallyHidden.Root>
              {previews.map((p) => (
                <Tabs.Trigger
                  key={p.value}
                  value={p.value}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    "text-fd-muted-foreground hover:bg-fd-muted hover:text-fd-foreground",
                    "data-[state=active]:bg-fd-primary data-[state=active]:text-fd-primary-foreground"
                  )}
                >
                  {p.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </div>

          <div className="bg-fd-background overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${idx * 100}%)` }}
            >
              {previews.map((p) => (
                <div key={p.value} className="w-full shrink-0">
                  <Image
                    src={p.src}
                    alt={p.label}
                    className="w-full select-none"
                    draggable={false}
                    priority={p.value === "1"}
                  />
                </div>
              ))}
            </div>
          </div>
        </Tabs.Root>
      </section>
    </Tooltip.Provider>
  );
};
