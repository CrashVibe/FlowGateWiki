"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/cn";
import type { VersionInfo } from "@/lib/github";
import { getFGateClientVersion, getFGateNexusVersion } from "@/lib/github";

interface VersionFilenameProps {
  repo: "nexus" | "client";
  template: string;
  fallbackVersion?: string;
}

export const VersionFilename = ({ repo, template, fallbackVersion = "vx.x.x" }: VersionFilenameProps) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchVersion = async () => {
      try {
        setIsLoading(true);
        const info = repo === "nexus" ? await getFGateNexusVersion() : await getFGateClientVersion();
        if (!cancelled) {
          setVersionInfo(info);
        }
      } catch (error) {
        console.error(`Failed to fetch ${repo} version:`, error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchVersion();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  const displayText = template.replaceAll(
    "{version}",
    isLoading && !versionInfo ? "vx.x.x" : (versionInfo?.version ?? fallbackVersion)
  );

  return (
    <code
      className={cn(
        "bg-fd-muted rounded px-1.5 py-0.5 font-mono text-[0.9em] transition-opacity",
        isLoading && "opacity-70"
      )}
    >
      {displayText}
    </code>
  );
};
