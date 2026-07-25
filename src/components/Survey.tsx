"use client";

import { useEffect, useRef, useState } from "react";

import { track } from "@/lib/analytics";
import type { SurveyOptionKey } from "@/lib/validation";

/* ------------------------------------------------------------------ *
 * Survey section (#survey)
 *
 * State A (#surveyForm): single-question poll — 6 accent-coded options.
 * Picking one fills its radio + tints it, echoes its label, then after
 * 320ms swaps to State B.
 * State B (#surveyThanks): green check emblem, thanks copy with the
 * echoed label, and an email-capture form (the survey-thanks .notify).
 * ------------------------------------------------------------------ */

type Accent = "blue" | "amber" | "green";

type Option = {
  id: string;
  key: SurveyOptionKey; // persisted via POST /api/vote
  accent: Accent;
  title: string;
  sub: string;
  label: string; // echoed into the thanks copy
  icon: React.ReactNode;
};

const ACCENT: Record<Accent, { color: string; tint: string }> = {
  blue: { color: "var(--blue)", tint: "var(--blue-tint)" },
  amber: { color: "var(--amber)", tint: "var(--amber-tint)" },
  green: { color: "var(--green)", tint: "var(--green-tint)" },
};

const iconProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const OPTIONS: Option[] = [
  {
    id: "o-price",
    key: "price",
    accent: "blue",
    title: "Справедливая цена",
    sub: "без переплат, без убытков",
    label: "справедливую цену",
    icon: (
      <svg {...iconProps}>
        <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.4Z" />
        <circle cx="7.5" cy="7.5" r="1.2" />
      </svg>
    ),
  },
  {
    id: "o-risk",
    key: "risk",
    accent: "amber",
    title: "Скрытые риски",
    sub: "скрутка, ДТП, залог",
    label: "проверку рисков",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3 4 6v5c0 5 3.4 8.2 8 10 4.6-1.8 8-5 8-10V6l-8-3Z" />
        <path d="M12 9v4" />
        <path d="M12 16.5h.01" />
      </svg>
    ),
  },
  {
    id: "o-choice",
    key: "choice",
    accent: "green",
    title: "Большой выбор",
    sub: "трудно решить",
    label: "подбор варианта",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path d="M3 12 12 16.5 21 12" />
        <path d="M3 16.5 12 21l9-4.5" />
      </svg>
    ),
  },
  {
    id: "o-cost",
    key: "cost",
    accent: "blue",
    title: "Стоимость владения",
    sub: "расходы после покупки",
    label: "стоимость владения",
    icon: (
      <svg {...iconProps}>
        <path d="M3 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1" />
        <path d="M3 8v9a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-4a1 1 0 0 0-1-1h-4a2 2 0 0 0 0 4h5" />
        <path d="M16.5 13h.01" />
      </svg>
    ),
  },
  {
    id: "o-post",
    key: "post",
    accent: "blue",
    title: "Подать объявление",
    sub: "платно и с лимитами",
    label: "бесплатную подачу объявлений",
    icon: (
      <svg {...iconProps}>
        <rect x="4" y="4" width="16" height="16" rx="3.5" stroke="currentColor" stroke-width="2" />
        <path d="M12 8.5v7M8.5 12h7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    ),
  },
  {
    id: "o-sell",
    key: "sell",
    accent: "green",
    title: "Безопасная сделка",
    sub: "оплата и переоформление",
    label: "безопасную сделку и переоформление",
    icon: (
      <svg {...iconProps}>
        <path d="M12 3 4 6v5c0 5 3.4 8.2 8 10 4.6-1.8 8-5 8-10V6l-8-3Z" />
        <path d="m8.8 11.5 2.2 2.2 4.2-4.4" />
      </svg>
    ),
  },
];

const SUCCESS_TEXT = "Готово! Напишем, как только откроемся.";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export default function Survey() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [echo, setEcho] = useState("это");
  const [submitted, setSubmitted] = useState(false);
  const [notifyDone, setNotifyDone] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll reveal: position-only, content always opaque (fail-safe).
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
    );
    io.observe(el);
    // revealNear — show immediately if already within viewport*1.15.
    if (el.getBoundingClientRect().top < window.innerHeight * 1.15) {
      el.classList.add("in");
      io.unobserve(el);
    }
    return () => io.disconnect();
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function pickSurvey(opt: Option) {
    // Ignore repeat clicks once a choice is locked in.
    if (selectedId) return;
    // Optimistic UI: tint the option + echo its label immediately, transition
    // to the thanks state after 320ms, and persist the vote in the background
    // (POST /api/vote). A failed request is logged but never rolls back the UI.
    setSelectedId(opt.id);
    setEcho(opt.label);
    void fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionKey: opt.key }),
    }).catch((err) => console.error("vote failed", err));
    // Analytics goal/event (no-op unless YM/GA IDs are configured).
    track("vote", { optionKey: opt.key });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSubmitted(true), 320);
  }

  function onNotifySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = emailRef.current;
    if (!input || !input.checkValidity()) {
      input?.focus();
      input?.reportValidity();
      return;
    }
    // Optimistic UI: confirm immediately, then persist in the background
    // (POST /api/subscribe, tagged with the survey source).
    const email = input.value;
    setNotifyDone(true);
    void fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "survey" }),
    }).catch((err) => console.error("subscribe failed", err));
  }

  return (
    <section
      id="survey"
      className="bg-surface"
      style={{ padding: "clamp(56px,8vw,96px) 0" }}
      aria-labelledby="survey-q"
    >
      {/* Scoped styles: hover/selected states, filled radio, focus ring,
          fade + reveal motion, all reduced-motion guarded. */}
      <style>{`
        .vs-scope :focus-visible {
          outline: 2.5px solid var(--blue);
          outline-offset: 3px;
          border-radius: 6px;
        }
        .vs-reveal {
          transform: translateY(14px);
          transition: transform .55s cubic-bezier(.2,.8,.2,1);
          will-change: transform;
        }
        .vs-reveal.in { transform: none; }
        .vs-opt {
          transition: transform .18s ease, box-shadow .18s ease,
            border-color .18s ease, background .18s ease;
        }
        .vs-opt:hover {
          transform: translateY(-3px);
          box-shadow: var(--sh-2);
          border-color: var(--vs-accent);
        }
        .vs-opt.on {
          border-color: var(--vs-accent);
          background: var(--vs-tint);
        }
        .vs-rad {
          width: 22px; height: 22px; flex: none;
          border-radius: var(--pill);
          border: 2px solid var(--line);
          background: transparent;
          transition: box-shadow .18s ease, background .18s ease,
            border-color .18s ease;
        }
        .vs-opt.on .vs-rad {
          background: var(--vs-accent);
          border-color: var(--vs-accent);
          box-shadow: inset 0 0 0 4px #fff;
        }
        .vs-thanks { animation: vsFade .4s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes vsFade {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .vs-reveal, .vs-reveal.in { transform: none; transition: none; }
          .vs-opt { transition: none; }
          .vs-opt:hover { transform: none; box-shadow: none; }
          .vs-thanks { animation: none; }
        }
      `}</style>

      <div className="vs-scope mx-auto w-full max-w-wrap px-6">
        <div
          ref={cardRef}
          data-reveal
          className="vs-reveal mx-auto w-full max-w-[720px] rounded-lg border border-line bg-surface shadow-2"
          style={{ padding: "clamp(24px,4vw,44px)" }}
        >
          {/* ---------------- State A: the poll ---------------- */}
          <div id="surveyForm" hidden={submitted}>
            <p className="text-center text-[12.5px] font-extrabold tracking-[1.2px] text-blue uppercase">
              Помогите сделать vrum полезным
            </p>
            <h2
              id="survey-q"
              className="mt-3 text-center font-display font-bold text-ink"
              style={{
                fontSize: "clamp(20px,2.6vw,26px)",
                letterSpacing: "-.5px",
                lineHeight: 1.15,
              }}
            >
              Что для вас самое сложное при покупке или продаже авто?
            </h2>
            <p className="mt-2 text-center font-medium text-ink-2">
              Один клик. Это подскажет нам, с чего начинать.
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
              {OPTIONS.map((opt) => {
                const on = selectedId === opt.id;
                const a = ACCENT[opt.accent];
                return (
                  <button
                    key={opt.id}
                    type="button"
                    data-label={opt.label}
                    onClick={() => pickSurvey(opt)}
                    aria-pressed={on}
                    className={`vs-opt${on ? " on" : ""} flex w-full items-center gap-3.5 rounded-r border border-line bg-surface p-4 text-left`}
                    style={
                      {
                        "--vs-accent": a.color,
                        "--vs-tint": a.tint,
                        minHeight: 72,
                      } as React.CSSProperties
                    }
                  >
                    <span
                      className="flex h-11 w-11 flex-none items-center justify-center rounded-[12px]"
                      style={{ background: a.tint, color: a.color }}
                    >
                      {opt.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold text-ink">
                        {opt.title}
                      </span>
                      <span className="block text-[12.5px] font-semibold text-ink-2">
                        {opt.sub}
                      </span>
                    </span>
                    <span
                      className="vs-rad"
                      style={{ color: a.color }}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* ---------------- State B: thanks + email ---------------- */}
          {submitted && (
            <div id="surveyThanks" className="vs-thanks show text-center">
              <span
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-green"
                style={{ background: "var(--green-tint)" }}
              >
                <CheckIcon />
              </span>
              <h3 className="mt-4 font-display text-[22px] font-bold text-ink">
                Спасибо! Это ценно.
              </h3>
              <p className="mx-auto mt-2 max-w-[460px] font-medium text-ink-2">
                Сделаем упор на{" "}
                <span id="surveyEcho" className="font-bold text-ink">
                  {echo}
                </span>{" "}
                в первую очередь. Оставьте email — сообщим о запуске.
              </p>

              <div className="notify-wrap mx-auto mt-6 max-w-[440px]">
                {!notifyDone ? (
                  <form
                    className="notify flex gap-2.5 max-[540px]:flex-col"
                    onSubmit={onNotifySubmit}
                    noValidate
                  >
                    <label htmlFor="survey-email" className="sr-only">
                      Ваш email
                    </label>
                    <input
                      ref={emailRef}
                      id="survey-email"
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      placeholder="Ваш email"
                      aria-label="Ваш email"
                      className="min-h-[52px] w-full flex-1 rounded-[14px] border border-line bg-surface px-4 text-[15.5px] text-ink shadow-1 outline-none placeholder:text-ink-3 focus:border-blue"
                    />
                    <button
                      type="submit"
                      className="inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[14px] bg-blue px-6 text-[15.5px] font-extrabold whitespace-nowrap text-white transition-transform hover:-translate-y-px max-[540px]:w-full"
                      style={{ boxShadow: "0 10px 24px rgba(30,91,255,.32)" }}
                    >
                      Сообщить о запуске
                    </button>
                  </form>
                ) : (
                  <p
                    className="notify-ok show flex items-center justify-center gap-2 font-semibold text-green"
                    role="status"
                  >
                    <span
                      className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-white"
                      style={{ background: "var(--green)" }}
                    >
                      <CheckIcon />
                    </span>
                    {SUCCESS_TEXT}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
