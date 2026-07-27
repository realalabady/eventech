"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  checkInTicket,
  validateTicket,
  type ScanOutcome,
} from "../services/scanner-service";
import { ScanResultCard } from "./scan-result";

/** Ignore repeats of the same code for this long, so one QR is not scanned twice. */
const DEDUPE_MS = 2500;

type CameraState = "idle" | "starting" | "running" | "unavailable";

/**
 * Door scanner. The camera decodes locally; every decision is server-side.
 *
 * Preview mode calls `validateTicket`, which does not spend the ticket — that
 * is why the two callables are kept separate (canonical §6). The default is
 * check-in, because at a door the common case is admitting someone.
 */
export function TicketScanner() {
  const t = useTranslations("scanner");
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<{ stop: () => void; destroy: () => void } | null>(
    null,
  );
  const lastScan = useRef<{ token: string; at: number } | null>(null);
  const busyRef = useRef(false);

  const [camera, setCamera] = useState<CameraState>("idle");
  const [previewOnly, setPreviewOnly] = useState(false);
  const [outcome, setOutcome] = useState<{
    /** Bumped per scan so a repeat verdict still replays its reveal. */
    id: number;
    value: ScanOutcome;
    previewOnly: boolean;
  } | null>(null);
  const [manual, setManual] = useState("");

  // The decode callback is created once when the camera starts, so it would
  // otherwise capture whichever mode was selected at that moment.
  const previewRef = useRef(previewOnly);
  useEffect(() => {
    previewRef.current = previewOnly;
  }, [previewOnly]);

  const submit = useCallback(async (token: string) => {
    const trimmed = token.trim();
    if (!trimmed || busyRef.current) return;

    const now = Date.now();
    if (
      lastScan.current?.token === trimmed &&
      now - lastScan.current.at < DEDUPE_MS
    ) {
      return;
    }
    lastScan.current = { token: trimmed, at: now };

    const preview = previewRef.current;
    busyRef.current = true;
    const result = preview
      ? await validateTicket(trimmed)
      : await checkInTicket(trimmed);
    busyRef.current = false;
    // `preview` is captured before the call, so toggling the switch while a
    // check-in is in flight cannot mislabel the verdict that comes back.
    setOutcome({ id: now, value: result, previewOnly: preview });
  }, []);

  const startCamera = useCallback(async () => {
    if (!videoRef.current || scannerRef.current) return;
    setCamera("starting");
    try {
      // Loaded on demand: the decoder ships its own worker and has no business
      // in the initial bundle for anyone who never opens the scanner.
      const { default: QrScanner } = await import("qr-scanner");
      const scanner = new QrScanner(
        videoRef.current,
        (result) => void submit(result.data),
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 4,
        },
      );
      await scanner.start();
      scannerRef.current = scanner;
      setCamera("running");
    } catch {
      // No camera, denied permission, or an insecure origin — the manual field
      // below stays usable, which is also how hardware scan guns are handled.
      setCamera("unavailable");
    }
  }, [submit]);

  useEffect(() => {
    return () => {
      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
        <div className="space-y-0.5">
          <Label htmlFor="preview-only">{t("previewLabel")}</Label>
          <p className="text-sm text-muted-foreground">{t("previewHint")}</p>
        </div>
        <Switch
          id="preview-only"
          checked={previewOnly}
          onCheckedChange={setPreviewOnly}
        />
      </div>

      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border bg-surface">
        <video
          ref={videoRef}
          className="size-full object-cover"
          muted
          playsInline
        />
        {camera !== "running" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface px-6 text-center">
            <p className="text-sm text-muted-foreground">
              {camera === "unavailable" ? t("cameraBlocked") : t("cameraIdle")}
            </p>
            {camera !== "unavailable" ? (
              <Button
                onClick={startCamera}
                disabled={camera === "starting"}
                size="sm"
              >
                {t("startCamera")}
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>

      {outcome ? (
        <ScanResultCard
          key={outcome.id}
          outcome={outcome.value}
          previewOnly={outcome.previewOnly}
        />
      ) : null}

      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(manual);
          setManual("");
        }}
      >
        <Label htmlFor="manual-token">{t("manualLabel")}</Label>
        <div className="flex gap-2">
          <Input
            id="manual-token"
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="font-mono"
          />
          <Button type="submit" variant="outline" disabled={!manual.trim()}>
            {t("manualSubmit")}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{t("manualHint")}</p>
      </form>
    </div>
  );
}
