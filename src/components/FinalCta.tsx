"use client";

import { useRef, useState, type FormEvent } from "react";

/**
 * Final CTA (id="notify") — the shared scroll target for every
 * "Сообщить о запуске" button across the landing page.
 *
 * Blue gradient background, white text, one email capture form using the
 * `.btn.white` variant, and a white success message. No privacy line here.
 */
export default function FinalCta() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [done, setDone] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const input = inputRef.current;
    if (!input) return;

    // Validate natively; on empty/invalid, focus + surface the browser hint.
    if (!input.checkValidity()) {
      input.focus();
      input.reportValidity();
      return;
    }

    // Optimistic UI: confirm immediately, then persist in the background
    // (POST /api/subscribe). Failures are logged but the UI stays confirmed.
    const email = input.value;
    setDone(true);
    void fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "final" }),
    }).catch((err) => console.error("subscribe failed", err));
  }

  return (
    <section
      id="notify"
      className="relative overflow-hidden text-white [padding:clamp(56px,8vw,96px)_0]"
      style={{ background: "linear-gradient(140deg,#2D63FF 0%,#0B3FCC 82%)" }}
    >
      {/* Decorative radial glow, top-right (mirrors .final::after) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-20 h-[260px] w-[260px] rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(255,255,255,.16),transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-wrap flex-col items-center px-6 text-center">
        <h2 className="max-w-[560px] font-display text-[clamp(26px,3.6vw,38px)] font-bold leading-[1.12] tracking-[-1px]">
          Узнайте первыми, когда откроемся
        </h2>

        <p className="mt-4 max-w-[520px] font-medium text-white/80">
          Оставьте email — напишем один раз, в день запуска.
          <br />
          Без спама.
        </p>

        <div className="mt-8 w-full max-w-[520px]">
          {done ? (
            <p
              role="status"
              aria-live="polite"
              className="flex items-center justify-center gap-2.5 font-bold text-white"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="shrink-0"
              >
                <path
                  d="M20 6 9 17l-5-5"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Готово! Напишем, как только откроемся.
            </p>
          ) : (
            <form
              noValidate
              onSubmit={handleSubmit}
              className="flex flex-row gap-3 max-[540px]:flex-col"
            >
              <label htmlFor="final-email" className="sr-only">
                Ваш email
              </label>
              <input
                ref={inputRef}
                id="final-email"
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="Ваш email"
                aria-label="Ваш email"
                className="min-h-[52px] flex-1 rounded-[14px] bg-white px-4 py-[15px] text-[15.5px] font-medium text-ink placeholder:text-ink-3 focus-visible:rounded-[6px] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-white"
              />
              <button
                type="submit"
                className="inline-flex min-h-[52px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[14px] bg-white px-7 py-[17px] text-[16.5px] font-extrabold text-blue-ink transition-[transform,box-shadow,background] duration-150 hover:-translate-y-px focus-visible:rounded-[6px] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-white motion-reduce:transform-none motion-reduce:transition-none max-[540px]:w-full"
              >
                Сообщить о запуске
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
