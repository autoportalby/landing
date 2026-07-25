export {};

declare global {
  interface Window {
    /** Yandex.Metrika global. */
    ym?: (id: number, action: string, ...args: unknown[]) => void;
    /** GA4 gtag global. */
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
