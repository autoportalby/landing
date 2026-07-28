"use client";

import { useRef, useState } from "react";

import { markSubscribed, useSubscribe, waitingText } from "@/lib/use-subscribe";

/**
 * 404 "AI search" as an honest pre-launch lead capture.
 *
 * There is no live search yet, so instead of a fake input we take a real
 * request: the visitor describes the car they want (step "car"), then leaves an
 * email (step "email"); we persist it as a subscriber note (POST /api/subscribe,
 * source "404") and confirm we'll find it at launch (step "done"). Suggested
 * prompts prefill the description field.
 */

const PROMPTS = [
  "семейный автомобиль до $15 000",
  "немецкое купе с характером",
  "экономичный городской автомобиль",
  "7 мест для большой семьи",
];

type Step = "car" | "email" | "done";

export default function NotFoundSearch() {
  const [step, setStep] = useState<Step>("car");
  const [query, setQuery] = useState("");
  const carRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  // Shared subscription state — if the visitor already left their email
  // anywhere (incl. the landing), this form shows the success state too.
  const { subscribed, count, ready } = useSubscribe();

  function fillPrompt(p: string) {
    setQuery(p);
    carRef.current?.focus();
  }

  function onCarSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!query.trim()) {
      carRef.current?.focus();
      return;
    }
    setStep("email");
    requestAnimationFrame(() => emailRef.current?.focus());
  }

  function onEmailSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = emailRef.current;
    if (!input || !input.checkValidity()) {
      input?.focus();
      input?.reportValidity();
      return;
    }
    // Optimistic confirm; markSubscribed persists (with the car request as note)
    // and flips the shared store so every form on the site shows success.
    setStep("done");
    markSubscribed(input.value, "404", query.trim().slice(0, 200));
  }

  // Wait until the shared store has read localStorage before deciding between
  // the form and the success state — otherwise the form flashes on load.
  if (!ready) return <div className="nf-skeleton" aria-hidden />;

  if (step === "done") {
    return (
      <div className="nf-done" role="status" aria-live="polite">
        <span className="nf-done-check" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="m5 12.5 4.5 4.5L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="nf-done-text">
          <b>Заявка принята.</b> Подберём и напишем, как только запустимся.
          <span className="nf-done-q">Ищем: {query.trim()}</span>
        </span>
      </div>
    );
  }

  // Already subscribed anywhere on the site (incl. the landing) — show success.
  if (subscribed) {
    return (
      <div className="nf-done" role="status" aria-live="polite">
        <span className="nf-done-check" aria-hidden>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="m5 12.5 4.5 4.5L19 7" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="nf-done-text">
          <b>Вы уже в списке.</b> Напишем, как только запустимся.
          {count != null && count > 0 ? (
            <span className="nf-done-q">{waitingText(count)}</span>
          ) : null}
        </span>
      </div>
    );
  }

  return (
    <>
      {step === "car" ? (
        <form key="car" className="nf-search" onSubmit={onCarSubmit} noValidate>
          <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z" fill="var(--blue)" />
          </svg>
          <input
            ref={carRef}
            className="nf-search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Опишите автомобиль, который ищете…"
            aria-label="Опишите автомобиль, который ищете"
            maxLength={200}
          />
          <button type="submit" className="nf-btn">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="2.2" />
              <path d="M20 20l-4-4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
            Найти автомобиль
          </button>
        </form>
      ) : (
        <>
          <p className="nf-note">
            <b>AI-подбор ещё в работе.</b> Оставьте email — подберём и пришлём
            варианты, как только запустимся.
          </p>
          <form key="email" className="nf-search" onSubmit={onEmailSubmit} noValidate>
          <svg className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="5" width="18" height="14" rx="3" stroke="var(--blue)" strokeWidth="2" />
            <path d="m4 7 8 6 8-6" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <input
            ref={emailRef}
            type="email"
            required
            autoComplete="email"
            className="nf-search-input"
            placeholder="Ваш email — пришлём подборку на запуске"
            aria-label="Ваш email"
          />
          <button type="submit" className="nf-btn">
            Оставить заявку
          </button>
          </form>
        </>
      )}

      {step === "car" ? (
        <div className="mt-4 flex flex-wrap justify-center gap-[9px]">
          {PROMPTS.map((p) => (
            <button key={p} type="button" className="nf-prompt" onClick={() => fillPrompt(p)}>
              <span className="nf-prompt-arrow">↗</span>
              {p}
            </button>
          ))}
        </div>
      ) : (
        <p className="nf-hint">
          Ищем: <b>{query.trim()}</b> ·{" "}
          <button type="button" className="nf-link" onClick={() => setStep("car")}>
            изменить
          </button>
        </p>
      )}
    </>
  );
}
