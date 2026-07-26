"use client";

import { useSyncExternalStore } from "react";

/**
 * Shared subscription state for every email-capture form on the page.
 *
 * A tiny module-level store (observer pattern via useSyncExternalStore) so all
 * forms agree on one truth: once the visitor leaves their email in ANY form,
 * every form flips to the success state — and stays there across reloads
 * (persisted in localStorage) and across tabs (via the `storage` event).
 *
 * It also tracks the public subscriber count (GET /api/subscribe), used to show
 * "уже ждут запуска N человек".
 */

const STORE_KEY = "vrum_subscribed";

type State = { subscribed: boolean; count: number | null };

// Client store. getServerSnapshot returns a constant so SSR/hydration always
// render the form (never a mismatched success state).
const SERVER_STATE: State = { subscribed: false, count: null };
let state: State = { subscribed: false, count: null };

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  emit();
}

function fetchCount() {
  void fetch("/api/subscribe")
    .then((r) => r.json())
    .then((d) => {
      if (d?.ok && typeof d.count === "number") setState({ count: d.count });
    })
    .catch(() => {});
}

let initialized = false;
function init() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    if (localStorage.getItem(STORE_KEY) === "1") state = { ...state, subscribed: true };
  } catch {}
  fetchCount();
  // Cross-tab: reflect a subscription made in another tab.
  window.addEventListener("storage", (e) => {
    if (e.key === STORE_KEY && e.newValue === "1") setState({ subscribed: true });
  });
}

/**
 * Record a subscription: optimistically flip every form to success, persist the
 * marker, POST it, then refresh the real count. Failures are logged but never
 * roll the UI back (matches the existing optimistic-confirm behaviour).
 */
export function markSubscribed(email: string, source: string) {
  try {
    localStorage.setItem(STORE_KEY, "1");
  } catch {}
  setState({
    subscribed: true,
    count: state.count != null ? state.count + 1 : state.count,
  });
  void fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source }),
  })
    .catch((err) => console.error("subscribe failed", err))
    // Reconcile with the server (handles dedupe: a repeat email won't bump it).
    .finally(() => fetchCount());
}

export function useSubscribe(): State {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      init();
      return () => listeners.delete(listener);
    },
    () => state,
    () => SERVER_STATE,
  );
}

// Russian declension for "человек" (1 человек, 2 человека, 5 человек) plus the
// matching verb, so the count line reads naturally for any N.
export function waitingText(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const one = mod10 === 1 && mod100 !== 11;
  const few = mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14);
  const noun = one ? "человек" : few ? "человека" : "человек";
  const verb = one ? "ждёт" : "ждут";
  return `С нетерпением ${verb} запуска уже ${count} ${noun}`;
}
