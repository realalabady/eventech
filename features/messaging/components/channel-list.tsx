"use client";

import { Hash } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { Skeleton } from "@/components/ui/skeleton";

import { compareChannels, type ChannelDoc } from "../types";

/**
 * The organization's channels, busiest first.
 *
 * The selected channel is marked by a shared layout indicator that slides
 * between rows, matching the workspace sidebar (§9: motion communicates
 * position rather than decorating).
 */
export function ChannelList({
  channels,
  selectedId,
  loading,
  failed,
  onSelect,
}: {
  channels: ChannelDoc[];
  selectedId: string | null;
  loading: boolean;
  failed: boolean;
  onSelect: (channelId: string) => void;
}) {
  const t = useTranslations("messaging");
  const reduce = useReducedMotion();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  if (failed) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {t("channels.failed")}
      </p>
    );
  }

  if (channels.length === 0) {
    return (
      <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        {t("channels.empty")}
      </p>
    );
  }

  return (
    <ul className="space-y-0.5">
      {[...channels].sort(compareChannels).map((channel) => {
        const active = channel.id === selectedId;
        return (
          <li key={channel.id}>
            <button
              type="button"
              onClick={() => onSelect(channel.id)}
              aria-current={active ? "true" : undefined}
              data-active={active}
              className="relative flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-start text-sm transition-colors duration-[var(--motion-fast)] outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=false]:text-muted-foreground"
            >
              {active ? (
                <motion.span
                  layoutId="channel-list-active"
                  className="absolute inset-0 -z-10 rounded-md bg-accent"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 380, damping: 32 }
                  }
                />
              ) : null}
              <Hash className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{channel.name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
