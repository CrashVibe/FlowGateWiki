import { Link2, MessageSquare, Server, Shield, Terminal, Zap } from "lucide-react";

import { cn } from "@/lib/cn";

const FeatureCard = ({
  icon: Icon,
  title,
  desc,
  tags,
  className,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  tags?: string[];
  className?: string;
}) => (
  <div className={cn("border-fd-border bg-fd-card rounded-xl border p-6", className)}>
    <div className="bg-fd-primary/10 text-fd-primary mb-4 inline-flex rounded-lg p-2.5">
      <Icon className="h-5 w-5" />
    </div>
    <h3 className="mb-2 text-base font-semibold">{title}</h3>
    <p className="text-fd-muted-foreground text-sm leading-relaxed">{desc}</p>
    {tags && (
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="border-fd-border bg-fd-muted text-fd-muted-foreground rounded-full border px-2.5 py-0.5 text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </div>
);

const CompactCard = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
  <div className="border-fd-border bg-fd-card flex flex-1 items-start gap-3 rounded-xl border p-5">
    <div className="bg-fd-primary/10 text-fd-primary shrink-0 rounded-lg p-2">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="text-fd-muted-foreground text-xs leading-relaxed">{desc}</p>
    </div>
  </div>
);

export const FeaturesSection = () => (
  <section className="pb-16">
    <div className="mb-10 text-center">
      <h2 className="mb-2 text-2xl font-bold sm:text-3xl">功能亮点</h2>
      <p className="text-fd-muted-foreground text-sm">开箱即用的服务器桥接管理能力</p>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <FeatureCard
        icon={Server}
        title="多服务器桥接管理"
        desc="同时接入多个 Minecraft 服务器与多个聊天适配器，统一管理所有桥接规则，灵活配置每条通道的行为。"
        tags={["OneBot / QQ", "更多适配器开发中"]}
        className="sm:col-span-2"
      />
      <FeatureCard icon={MessageSquare} title="消息双向同步" desc="游戏内聊天与外部平台实时互通，不错过任何消息。" />
      <FeatureCard icon={Shield} title="安全认证" desc="支持密码与 2FA 双重认证，所有数据本地处理，不上传、不收集。" />
      <div className="flex flex-col gap-4">
        <CompactCard icon={Link2} title="账号绑定" desc="玩家自助绑定 / 解绑平台账号，权限精细可控。" />
        <CompactCard icon={Terminal} title="远程命令" desc="通过聊天平台直接下发服务器指令，随时随地管理。" />
      </div>
      <FeatureCard
        icon={Zap}
        title="实时事件通知"
        desc="玩家进出、服务器启停、异常告警等事件自动推送到聊天平台，第一时间掌握服务器动态。"
      />
    </div>
  </section>
);
