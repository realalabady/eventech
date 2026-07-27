"use client";

import { SendHorizontal } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatPublicDate } from "@/features/discovery/lib/format";

import { useChannelMessages } from "../hooks/use-messaging";
import { sendMessage } from "../services/messaging-service";
import { startsNewGroup } from "../types";

const MAX_BODY = 2000;

/**
 * One channel's conversation, oldest at the top, with its composer.
 *
 * Sending is **not** optimistic: canonical §11 allows optimistic UI for the
 * Kanban and favourites, and a message that appears and then silently fails to
 * exist is exactly the kind of lie that rule is guarding against.
 */
export function MessageThread({
  channelId,
  currentUserId,
  /** uid → display name, resolved by the caller from the team roster. */
  authorNames,
}: {
  channelId: string;
  currentUserId: string | null;
  authorNames: Record<string, string>;
}) {
  const t = useTranslations("messaging");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const { messages, loading, failed } = useChannelMessages(channelId);

  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSend() {
    const trimmed = body.trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setError(null);
    const result = await sendMessage(channelId, trimmed);
    setBusy(false);

    if (result.ok) {
      setBody("");
    } else {
      setError(result.errorKey);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="min-h-64 flex-1">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-10 w-1/2" />
          </div>
        ) : failed ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {t("thread.failed")}
          </p>
        ) : messages.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
            {t("thread.empty")}
          </p>
        ) : (
          <ol className="space-y-1">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const fresh = startsNewGroup(message, messages[index - 1]);
                const mine = message.authorId === currentUserId;
                const when = formatPublicDate(
                  message.createdAt?.toMillis() ?? null,
                  null,
                  locale,
                  "d MMM, HH:mm",
                );

                return (
                  <motion.li
                    key={message.id}
                    layout={reduce ? false : "position"}
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className={fresh ? "pt-3 first:pt-0" : undefined}
                  >
                    {fresh ? (
                      <p className="flex items-baseline gap-2 px-1 pb-1">
                        <span className="text-sm font-medium">
                          {mine
                            ? t("thread.you")
                            : (authorNames[message.authorId] ??
                              t("thread.unknownAuthor"))}
                        </span>
                        {when ? (
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {when}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                    <p className="whitespace-pre-wrap px-1 text-sm text-foreground/90">
                      {message.body}
                    </p>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={(event) => {
            // Enter sends, Shift+Enter breaks the line — the convention every
            // chat surface has trained people to expect.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void onSend();
            }
          }}
          maxLength={MAX_BODY}
          rows={2}
          aria-label={t("thread.composerLabel")}
          placeholder={t("thread.composerPlaceholder")}
        />

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {t(`errors.${error}`)}
          </p>
        ) : null}

        <div className="flex justify-end">
          <Button size="sm" onClick={onSend} disabled={busy || !body.trim()}>
            <SendHorizontal className="size-4 rtl:-scale-x-100" aria-hidden />
            {t("thread.send")}
          </Button>
        </div>
      </div>
    </div>
  );
}
