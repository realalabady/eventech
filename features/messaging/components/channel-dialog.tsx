"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createChannel } from "../services/messaging-service";

/**
 * Create a channel. Only owners and managers reach this — the callable enforces
 * that, and a rejected attempt surfaces as `permissionDenied` rather than the
 * button being quietly absent.
 */
export function ChannelDialog({
  open,
  onOpenChange,
  organizationId,
  eventOptions,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  /** Plain data from the composition layer — features never import each other. */
  eventOptions: { id: string; title: string }[];
  onCreated: (channelId: string) => void;
}) {
  const t = useTranslations("messaging");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [eventId, setEventId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    if (!name.trim()) {
      setError("validationFailed");
      return;
    }
    setBusy(true);
    setError(null);

    const result = await createChannel(
      organizationId,
      name.trim(),
      topic.trim() || null,
      eventId || null,
    );
    setBusy(false);

    if (result.ok) {
      if (result.data?.channelId) onCreated(result.data.channelId);
      onOpenChange(false);
    } else {
      setError(result.errorKey);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("dialog.create")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">{t("dialog.nameLabel")}</Label>
            <Input
              id="channel-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={60}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-topic">{t("dialog.topicLabel")}</Label>
            <Input
              id="channel-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              maxLength={160}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel-event">{t("dialog.eventLabel")}</Label>
            <Select
              items={[
                { value: "", label: t("dialog.eventNone") },
                ...eventOptions.map((option) => ({
                  value: option.id,
                  label: option.title,
                })),
              ]}
              value={eventId}
              onValueChange={(value) => setEventId(value ?? "")}
            >
              <SelectTrigger id="channel-event" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("dialog.eventNone")}</SelectItem>
                {eventOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {t(`errors.${error}`)}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={onSave} disabled={busy}>
            {t("dialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
