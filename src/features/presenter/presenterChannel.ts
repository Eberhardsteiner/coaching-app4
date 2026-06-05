/**
 * Presenter live-mirroring over BroadcastChannel (same origin, same browser —
 * no realtime server). The coach view is the only sender: after each successful
 * autosave it posts a slim `session-updated` ping. The stage (presenter) window
 * listens and re-reads the persisted session from Dexie. Degrades silently when
 * BroadcastChannel is unavailable.
 */

export const PRESENTER_CHANNEL_NAME = "nhs-coaching-presenter";

export type PresenterMessage = {
  type: "session-updated";
  id: string;
  updatedAt?: string;
};

/** Lazily-created sender channel (singleton; the coach view only posts). */
let senderChannel: BroadcastChannel | null = null;

function getSenderChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === "undefined") return null;
  if (!senderChannel) {
    try {
      senderChannel = new BroadcastChannel(PRESENTER_CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return senderChannel;
}

/** Notify any open presenter window that the session was persisted. */
export function broadcastSessionUpdated(id: string, updatedAt?: string): void {
  const channel = getSenderChannel();
  if (!channel) return;
  try {
    channel.postMessage({
      type: "session-updated",
      id,
      updatedAt,
    } satisfies PresenterMessage);
  } catch {
    /* degrade silently */
  }
}

/**
 * Subscribe to updates for one session id (stage window, read-only). Calls
 * `onUpdate` when a matching ping arrives. Returns a cleanup that closes the
 * channel. No-op (and a no-op cleanup) when BroadcastChannel is unavailable.
 */
export function subscribeToSession(
  id: string,
  onUpdate: () => void,
): () => void {
  if (typeof BroadcastChannel === "undefined") return () => {};

  let channel: BroadcastChannel;
  try {
    channel = new BroadcastChannel(PRESENTER_CHANNEL_NAME);
  } catch {
    return () => {};
  }

  function handle(event: MessageEvent) {
    const data = event.data as PresenterMessage | undefined;
    if (data?.type === "session-updated" && data.id === id) onUpdate();
  }

  channel.addEventListener("message", handle);
  return () => {
    channel.removeEventListener("message", handle);
    channel.close();
  };
}
