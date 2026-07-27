"use client";

import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useEvents } from "@/features/event/hooks/use-events";
import { ChannelDialog } from "@/features/messaging/components/channel-dialog";
import { ChannelList } from "@/features/messaging/components/channel-list";
import { MessageThread } from "@/features/messaging/components/message-thread";
import { useChannels } from "@/features/messaging/hooks/use-messaging";
import { compareChannels } from "@/features/messaging/types";
import { useMembers } from "@/features/organization/hooks/use-members";
import { useOrganization } from "@/features/organization/hooks/use-organization";

/**
 * Composition layer for team communication.
 *
 * Author names come from the team roster rather than being denormalised onto
 * every message, so a member who changes their display name does not leave a
 * trail of stale bylines behind them. `organizationMembers` is already readable
 * by any active member, so this costs one listener the page mostly has anyway.
 */
export function MessagingPanel() {
  const t = useTranslations("messaging");
  const { user } = useAuth();
  const { organization } = useOrganization();
  const { channels, loading, failed } = useChannels(organization?.id);
  const { members } = useMembers(organization?.id);
  const { events } = useEvents(organization?.id);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [session, setSession] = useState(0);

  const authorNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const member of members) {
      if (member.userId) {
        names[member.userId] = member.displayName ?? member.email;
      }
    }
    return names;
  }, [members]);

  const eventOptions = useMemo(
    () => events.map((event) => ({ id: event.id, title: event.title })),
    [events],
  );

  // Land on the busiest channel rather than an empty right-hand pane. Derived
  // during render, so nothing is set from inside an effect (gotcha #9).
  const activeId =
    selectedId ??
    (channels.length > 0 ? [...channels].sort(compareChannels)[0].id : null);

  function openNew() {
    setSession((count) => count + 1);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
        <Button size="sm" onClick={openNew} disabled={!organization}>
          <Plus className="size-4" aria-hidden />
          {t("newChannel")}
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <ChannelList
          channels={channels}
          selectedId={activeId}
          loading={loading}
          failed={failed}
          onSelect={setSelectedId}
        />

        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          {activeId ? (
            <MessageThread
              key={activeId}
              channelId={activeId}
              currentUserId={user?.uid ?? null}
              authorNames={authorNames}
            />
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {t("thread.noChannel")}
            </p>
          )}
        </section>
      </div>

      {organization ? (
        <ChannelDialog
          key={session}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          organizationId={organization.id}
          eventOptions={eventOptions}
          onCreated={setSelectedId}
        />
      ) : null}
    </div>
  );
}
