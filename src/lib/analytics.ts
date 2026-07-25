/**
 * Analytics IDs + a tiny event helper that fans out to Yandex.Metrika and GA4.
 *
 * Both are optional: with no env IDs set, nothing loads (see Analytics.tsx) and
 * `track()` is a no-op — safe for local dev and the pre-launch state.
 *
 * Create the counters, then set in the hosting env:
 *   NEXT_PUBLIC_YM_ID   Yandex.Metrika counter id (digits)
 *   NEXT_PUBLIC_GA_ID   GA4 measurement id (G-XXXXXXX)
 */
export const YM_ID = process.env.NEXT_PUBLIC_YM_ID;
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Params = Record<string, unknown>;

/** Fire an analytics event/goal to whichever providers are configured. */
export function track(event: string, params?: Params): void {
  if (typeof window === "undefined") return;

  if (YM_ID && typeof window.ym === "function") {
    window.ym(Number(YM_ID), "reachGoal", event, params);
  }
  if (GA_ID && typeof window.gtag === "function") {
    window.gtag("event", event, params ?? {});
  }
}
