import { toast as sonner } from "sonner";

import { duration as motionDuration } from "@/lib/motion";

/**
 * Toast helpers.
 *
 * Sonner is already mounted in the locale layout but was never called from
 * anywhere — every mutation in the app succeeded or failed silently. This wraps
 * it so the four kinds are consistent and so dismiss timing is decided once.
 *
 * Every argument is already-translated text. No key lookup happens here: this
 * module is imported by client components that already hold a `t`, and doing
 * translation in two places is how `en.json` and `ar.json` drift apart.
 */

/**
 * Errors persist until dismissed. Everything else clears on its own — but an
 * error the user blinked past is an error they will hit again.
 */
const AUTO_DISMISS_MS = 4000;

type ToastOptions = {
  /** Already-translated secondary line. */
  description?: string;
  /** Optional undo affordance. `label` must already be translated. */
  undo?: { label: string; onUndo: () => void };
};

function withUndo(options?: ToastOptions) {
  if (!options?.undo) return undefined;
  return { label: options.undo.label, onClick: options.undo.onUndo };
}

export const toast = {
  success(message: string, options?: ToastOptions) {
    return sonner.success(message, {
      description: options?.description,
      duration: AUTO_DISMISS_MS,
      action: withUndo(options),
    });
  },

  info(message: string, options?: ToastOptions) {
    return sonner.info(message, {
      description: options?.description,
      duration: AUTO_DISMISS_MS,
      action: withUndo(options),
    });
  },

  warning(message: string, options?: ToastOptions) {
    return sonner.warning(message, {
      description: options?.description,
      duration: AUTO_DISMISS_MS,
      action: withUndo(options),
    });
  },

  /** Stays until dismissed — see AUTO_DISMISS_MS. */
  error(message: string, options?: ToastOptions) {
    return sonner.error(message, {
      description: options?.description,
      duration: Infinity,
      action: withUndo(options),
    });
  },

  /**
   * Pending → resolved in one toast, for work with a real await: publishing an
   * event, generating a ticket, approving a booking. Sonner swaps the content
   * in place, so the user is not left wondering whether the click registered.
   */
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) {
    return sonner.promise(promise, {
      loading: messages.loading,
      success: () => messages.success,
      error: () => messages.error,
    });
  },

  dismiss(id?: string | number) {
    return sonner.dismiss(id);
  },
};

/** Exported so the Toaster and these helpers cannot drift apart. */
export const TOAST_MOTION_SECONDS = motionDuration.base;
