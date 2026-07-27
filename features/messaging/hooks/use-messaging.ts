"use client";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { getFirebaseFirestore } from "@/firebase/client";

import type { ChannelDoc, MessageDoc } from "../types";

const NO_CHANNELS: ChannelDoc[] = [];
const NO_MESSAGES: MessageDoc[] = [];

/**
 * The most recent messages in a channel are the only ones anybody scrolls to,
 * and an uncapped realtime listener on a busy channel is a memory and cost
 * problem that grows forever. Same cap-and-reverse shape as the activity feed.
 */
const PAGE_SIZE = 50;

/**
 * Every channel in the organization.
 *
 * Unordered on purpose: sorting by `lastMessageAt` server-side would need a
 * composite index for no benefit at this cardinality. Sorted in memory by
 * `compareChannels` at the call site.
 */
export function useChannels(organizationId: string | undefined) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    items: ChannelDoc[];
    failed?: boolean;
  }>({ key: null, items: NO_CHANNELS });

  useEffect(() => {
    if (status !== "authenticated" || !organizationId) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "channels"),
        where("organizationId", "==", organizationId),
      ),
      (result) =>
        setSnapshot({
          key: organizationId,
          items: result.docs.map(
            (document) =>
              ({ id: document.id, ...document.data() }) as ChannelDoc,
          ),
        }),
      (error) => {
        console.error("channels listener failed", error);
        setSnapshot({ key: organizationId, items: NO_CHANNELS, failed: true });
      },
    );
  }, [status, organizationId]);

  if (status !== "authenticated" || !organizationId) {
    return {
      channels: NO_CHANNELS,
      loading: status === "loading",
      failed: false,
    };
  }
  if (snapshot.key !== organizationId) {
    return { channels: NO_CHANNELS, loading: true, failed: false };
  }
  return {
    channels: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}

/**
 * The last {@link PAGE_SIZE} messages in a channel, oldest first.
 *
 * Firestore can only take the *latest* N by ordering descending, so the page is
 * reversed here — a thread reads top to bottom.
 *
 * **The `organizationId` filter is load-bearing, not redundant.** Firestore
 * rules are not filters: a `list` is rejected outright unless the query's own
 * constraints prove every possible result satisfies the rule. The `messages`
 * rule grants access via `isActiveMember(resource.data.organizationId)`, so a
 * query keyed only on `channelId` is denied with `permission-denied` even
 * though every message it would return is readable by the caller.
 *
 * Needs the composite index `messages(organizationId, channelId, createdAt)`;
 * without it the listener errors and `failed` surfaces that rather than showing
 * an empty conversation (gotcha #4).
 */
export function useChannelMessages(
  channelId: string | undefined,
  organizationId: string | undefined,
) {
  const { status } = useAuth();
  const [snapshot, setSnapshot] = useState<{
    key: string | null;
    items: MessageDoc[];
    failed?: boolean;
  }>({ key: null, items: NO_MESSAGES });

  useEffect(() => {
    if (status !== "authenticated" || !channelId || !organizationId) return;

    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "messages"),
        where("organizationId", "==", organizationId),
        where("channelId", "==", channelId),
        orderBy("createdAt", "desc"),
        limit(PAGE_SIZE),
      ),
      (result) =>
        setSnapshot({
          key: channelId,
          items: result.docs
            .map(
              (document) =>
                ({ id: document.id, ...document.data() }) as MessageDoc,
            )
            .reverse(),
        }),
      (error) => {
        console.error("messages listener failed", error);
        setSnapshot({ key: channelId, items: NO_MESSAGES, failed: true });
      },
    );
  }, [status, channelId, organizationId]);

  if (status !== "authenticated" || !channelId || !organizationId) {
    return { messages: NO_MESSAGES, loading: false, failed: false };
  }
  if (snapshot.key !== channelId) {
    return { messages: NO_MESSAGES, loading: true, failed: false };
  }
  return {
    messages: snapshot.items,
    loading: false,
    failed: snapshot.failed ?? false,
  };
}
