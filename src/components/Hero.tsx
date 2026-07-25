"use client";

import { useRef, useState } from "react";

/**
 * Hero — pixel-faithful reproduction of the vrum.by landing "Hero" section.
 *
 * Left column: badge (pulsing amber dot), display H1 with gradient span,
 * sub paragraph, email notify form with client-side success state, privacy line.
 * Right column: decorative phone mockup rendering a mock vrum.by app screen
 * (status bar, app header, AI search bar, one featured car card with a verdict
 * dial gauge, and two compact list items).
 *
 * Motion (pulse dot, focus ring, button hover) is guarded by
 * prefers-reduced-motion. The email is not sent anywhere — the form only
 * toggles the local success state (spec: TODO for Formspree/Tally/Mailchimp).
 */
export default function Hero() {
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = inputRef.current;
    if (!input || !input.checkValidity()) {
      input?.focus();
      input?.reportValidity();
      return;
    }
    // Optimistic UI: flip to the success state immediately, then persist the
    // subscription in the background (POST /api/subscribe). Failures are logged
    // but do not roll the UI back — the spec always confirms to the visitor.
    const email = input.value;
    setDone(true);
    void fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "hero" }),
    }).catch((err) => console.error("subscribe failed", err));
  }

  return (
    <>
      {/* Scoped keyframes / motion, reduced-motion guarded */}
      <style jsx global>{`
        @keyframes vrum-pulse-dot {
          0% {
            box-shadow: 0 0 0 0 rgba(230, 146, 0, 0.5);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(230, 146, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(230, 146, 0, 0);
          }
        }
        .vrum-b-dot {
          animation: vrum-pulse-dot 2s infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .vrum-b-dot {
            animation: none;
            box-shadow: 0 0 0 3px rgba(230, 146, 0, 0.25);
          }
        }
      `}</style>

      <section
        className="relative w-full"
        style={{
          background:
            "radial-gradient(900px 500px at 12% -8%,#E7ECFF 0%,transparent 58%), radial-gradient(760px 520px at 108% 4%,#E6F6FF 0%,transparent 52%), #FBFCFE",
        }}
      >
        <div className="mx-auto grid max-w-wrap items-center gap-10 px-6 pt-[72px] pb-[84px] [grid-template-columns:1.05fr_.95fr] min-[861px]:min-h-[calc(100svh-66px)] max-[860px]:grid-cols-1 max-[860px]:justify-items-center max-[860px]:gap-[34px] max-[860px]:pt-11 max-[860px]:pb-14 max-[860px]:text-center">
          {/* ── Left column: copy + notify form ─────────────────────────── */}
          <div className="max-[860px]:flex max-[860px]:flex-col max-[860px]:items-center">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-pill border border-[#F6E4C0] bg-amber-tint px-3.5 py-1.5 text-[12.5px] font-extrabold tracking-[0.2px] text-amber">
              <span
                className="vrum-b-dot inline-block h-[7px] w-[7px] shrink-0 rounded-full"
                style={{ background: "var(--amber-bg)" }}
                aria-hidden="true"
              />
              В разработке · скоро в Беларуси
            </span>

            {/* H1 */}
            <h1 className="mt-5 font-display font-extrabold text-ink [font-size:clamp(34px,5vw,52px)] [letter-spacing:-1.4px] [line-height:1.06]">
              Найдите не просто авто,
              <br />а{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(100deg,var(--blue),var(--green))",
                }}
              >
                лучший вариант
              </span>
            </h1>

            {/* Sub */}
            <p className="mt-4 max-w-[520px] font-medium text-ink-2 [font-size:clamp(16px,1.8vw,18.5px)]">
              Поиск машины отнимает недели и полон рисков.
              <br />
              Врум подберёт авто под ваш бюджет и задачи, проверит объявление и
              честно скажет, стоит ли брать.
            </p>

            {/* Notify wrap: form + success + privacy */}
            <div className="relative mt-7 w-full max-w-[520px]">
              {!done ? (
                <form
                  onSubmit={onSubmit}
                  noValidate
                  className="flex gap-3 max-[540px]:flex-col"
                >
                  <label htmlFor="hero-email" className="sr-only">
                    Ваш email
                  </label>
                  <input
                    ref={inputRef}
                    id="hero-email"
                    type="email"
                    name="email"
                    required
                    placeholder="Ваш email"
                    aria-label="Ваш email"
                    autoComplete="email"
                    className="min-h-[52px] flex-1 rounded-[14px] border border-line bg-surface px-4 py-[15px] text-[15.5px] font-medium text-ink shadow-1 outline-none placeholder:text-ink-3 focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-blue"
                  />
                  <button
                    type="submit"
                    className="inline-flex min-h-[52px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[14px] bg-blue px-[22px] py-[15px] text-[15.5px] font-extrabold text-white shadow-[0_10px_24px_rgba(30,91,255,.32)] transition-[transform,box-shadow,background] duration-150 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(30,91,255,.4)] focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-blue motion-reduce:transform-none motion-reduce:transition-none max-[540px]:w-full"
                  >
                    Сообщить о запуске
                  </button>
                </form>
              ) : (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex items-center gap-2.5 rounded-[14px] border border-green-tint bg-green-tint px-4 py-[15px] text-[15px] font-bold text-ink max-[860px]:justify-center"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <circle cx="12" cy="12" r="10" fill="var(--green)" />
                    <path
                      d="M7.5 12.5l3 3 6-6.5"
                      stroke="#fff"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Готово! Напишем, как только откроемся.
                </div>
              )}

              {/* Privacy */}
              <p className="mt-3 text-[12.5px] font-semibold text-ink-3">
                Без спама. Одно письмо — в день запуска. ·{" "}
                <a
                  href="#how"
                  className="font-bold text-blue transition-colors hover:text-blue-ink focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-blue"
                >
                  Как это работает
                </a>
              </p>
            </div>
          </div>

          {/* ── Right column: phone mockup ──────────────────────────────── */}
          <div
            data-reveal
            className="relative flex items-center justify-right max-[380px]:scale-90"
          >
            {/* mock-stage::before — soft radial glow behind the device */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle,rgba(30,91,255,.16),transparent 70%)",
              }}
            />

            <PhoneMock />
          </div>
        </div>
      </section>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Shared mock artwork.
 * ──────────────────────────────────────────────────────────────────────── */

/** Detailed car silhouette used in the featured photo and the list thumbs. */
function CarSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 90" className={className} aria-hidden="true">
      <path d="M12 64c-3 0-6-2-6-6 0-7 6-10 14-12l14-3 18-15c6-5 14-8 24-9l34-2c14 0 26 3 38 11l16 11 28 4c12 2 20 7 20 15 0 4-3 6-7 6h-18a18 18 0 0 1-35 0H65a18 18 0 0 1-35 0H12z" />
      <circle cx="47" cy="63" r="11" fill="rgba(14,23,38,.55)" />
      <circle cx="170" cy="63" r="11" fill="rgba(14,23,38,.55)" />
    </svg>
  );
}

/** Compass/star brand mark (matches the nav/original). */
function StarMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3 14 10 21 12 14 14 12 21 10 14 3 12 10 10z"
        fill="#fff"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * Decorative phone device rendering the mock vrum.by app screen.
 * role="img" with a descriptive aria-label; all inner text is decorative.
 * Sizes/paddings mirror the prototype (.phone/.scr/.mk-* in vrum-landing.html).
 * ──────────────────────────────────────────────────────────────────────── */
function PhoneMock() {
  return (
    <div
      role="img"
      aria-label="Экран будущего приложения vrum.by: подбор авто с AI-вердиктом"
      className="relative h-[612px] w-[300px] shrink-0 rounded-[46px] p-[11px]"
      style={{
        background: "#0E1726",
        boxShadow: "var(--sh-3), inset 0 0 0 2px #2b3446",
      }}
    >
      {/* screen */}
      <div className="relative h-full overflow-hidden rounded-[36px] bg-[#F6F7F9]">
        {/* notch */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-3 z-[6] h-[23px] w-[92px] -translate-x-1/2 rounded-[13px] bg-[#0E1726]"
        />

        {/* status bar (absolute top layer) */}
        <div className="absolute inset-x-0 top-0 z-[5] flex h-[42px] items-center justify-between pl-6 pr-[21px] text-[12px] font-extrabold text-ink">
          <span>9:41</span>
          <span className="flex items-center gap-[5px]" aria-hidden="true">
            <svg width="16" height="11" viewBox="0 0 17 11" fill="none">
              <path d="M1 6.5 3 4M8.5 1 3 4M8.5 1 14 4M16 6.5 14 4" stroke="#0E1726" strokeWidth="1.6" strokeLinecap="round" />
              <rect x="6" y="6" width="5" height="4.5" rx="1.5" fill="#0E1726" />
            </svg>
            <svg width="20" height="11" viewBox="0 0 20 11" fill="none">
              <rect x="1" y="1" width="16" height="9" rx="2.5" stroke="#0E1726" strokeWidth="1.3" />
              <rect x="2.6" y="2.6" width="11" height="5.8" rx="1.2" fill="#0E1726" />
              <rect x="18" y="3.6" width="1.6" height="3.8" rx="1" fill="#0E1726" />
            </svg>
          </span>
        </div>

        {/* app screen */}
        <div className="absolute inset-x-0 bottom-0 top-[42px] overflow-hidden px-[14px] pt-2">
          {/* header */}
          <div className="flex items-center gap-2 px-0.5 pb-3 pt-1">
            <span className="font-display text-[15px] font-extrabold leading-none">
              <span className="text-blue">vrum</span>
              <span className="text-ink-3">.by</span>
            </span>
            <span className="ml-auto rounded-pill border border-line bg-white px-[9px] py-[5px] text-[10.5px] font-bold text-ink-2">
              Минск
            </span>
            <span className="grid size-[30px] place-items-center rounded-[9px] border border-line bg-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" stroke="#0E1726" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M10 19a2 2 0 0 0 4 0" stroke="#0E1726" strokeWidth="1.8" />
              </svg>
            </span>
          </div>

          {/* AI search bar */}
          <div className="mb-[15px] flex items-center gap-2 rounded-[13px] border border-line bg-white px-[11px] py-[10px] text-[12px] font-semibold text-ink-3 shadow-1">
            <span
              className="grid size-6 shrink-0 place-items-center rounded-[7px]"
              style={{ background: "linear-gradient(150deg,#3D72FF,#0B3FCC)" }}
            >
              <StarMark size={14} />
            </span>
            <span className="min-w-0 flex-1 truncate">
              Надёжный кроссовер на автомате до $18k для семьи
            </span>
            <span className="shrink-0 rounded-[6px] bg-blue-tint px-1.5 py-[3px] text-[9px] font-extrabold text-blue">
              AI
            </span>
          </div>

          {/* label */}
          <div className="mx-0.5 mb-2.5 text-[13px] font-extrabold tracking-[-0.2px] text-ink">
            AI нашёл <b className="font-extrabold text-blue">6 сильных вариантов</b>
          </div>

          {/* featured car card */}
          <div className="mb-[13px] overflow-hidden rounded-[18px] border border-line bg-white shadow-2">
            {/* photo */}
            <div
              className="relative aspect-[16/10] overflow-hidden"
              style={{ background: "linear-gradient(150deg,#3a557e,#1c2b44)" }}
            >
              <CarSilhouette className="absolute bottom-[-6%] left-1/2 w-[88%] -translate-x-1/2 fill-[rgba(255,255,255,0.92)]" />
              {/* "Проверено" tag — green pill, white shield + text */}
              <span
                className="absolute left-[9px] top-[9px] flex items-center gap-1 rounded-pill px-2 py-1 text-[10px] font-extrabold text-white"
                style={{ background: "rgba(15,179,107,.94)" }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
                  <path d="M12 3 5 6v5c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" />
                </svg>
                Проверено
              </span>
              {/* match badge — white pill bottom-left, green "92" circle + dark label */}
              <span className="absolute bottom-[9px] left-[9px] flex items-center gap-1.5 rounded-pill bg-white/95 py-1 pl-[9px] pr-[5px] text-[11px] font-extrabold text-ink">
                <span className="grid size-5 place-items-center rounded-full bg-green font-display text-[10px] font-normal text-white">
                  92
                </span>
                Подходит вам
              </span>
            </div>

            {/* card body */}
            <div className="px-3 pb-[13px] pt-[11px]">
              <div className="flex items-start">
                <div>
                  <div className="text-[14.5px] font-extrabold text-ink">Toyota RAV4</div>
                  <div className="mt-px text-[11px] font-semibold text-ink-2">
                    2019 · 78 000 км · автомат
                  </div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-display text-[14.5px] font-bold text-ink">$24 900</div>
                  <span className="mt-0.5 inline-block rounded-pill bg-green-tint px-1.5 py-0.5 text-[10px] font-extrabold text-green">
                    ↓ 5% к рынку
                  </span>
                </div>
              </div>

              {/* verdict: dial + text, gradient left accent bar */}
              <div className="relative mt-[11px] flex items-center gap-2.5 overflow-hidden rounded-[12px] bg-surface-2 p-2.5 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[linear-gradient(180deg,var(--blue),var(--green))]">
                <VerdictDial />
                <p className="text-[10.5px] font-semibold leading-[1.4] text-[#2a3446]">
                  Сильный семейный вариант, цена ниже рынка. Стоит проверить пробег.
                </p>
              </div>
            </div>
          </div>

          {/* two compact list items */}
          <MockListItem
            name="Skoda Octavia"
            trim="2020 · 62 000 км · робот"
            price="$16 400"
            score="88"
            thumb="linear-gradient(150deg,#6b4f2e,#3a2a16)"
          />
          <MockListItem
            name="Kia Sportage"
            trim="2019 · 71 000 км · автомат"
            price="$17 800"
            score="86"
            thumb="linear-gradient(150deg,#3f4b5c,#232c3a)"
          />
        </div>
      </div>
    </div>
  );
}

/* Verdict dial gauge — 86/100. r=34 → circumference 213.6; offset 29.9 (~86%). */
function VerdictDial() {
  return (
    <div className="relative size-12 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90" aria-hidden="true">
        <circle cx="40" cy="40" r="34" fill="none" stroke="var(--line-2)" strokeWidth="8" />
        <circle
          cx="40"
          cy="40"
          r="34"
          fill="none"
          stroke="var(--green)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="213.6"
          strokeDashoffset="29.9"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center leading-none">
        <b className="font-display text-[15px] font-bold text-ink">86</b>
        <small className="block text-[7px] font-bold text-ink-3">из 100</small>
      </div>
    </div>
  );
}

function MockListItem({
  name,
  trim,
  price,
  score,
  thumb,
}: {
  name: string;
  trim: string;
  price: string;
  score: string;
  thumb: string;
}) {
  return (
    <div className="mb-[9px] flex items-center gap-2.5 rounded-[14px] border border-line bg-white py-2 pl-2 pr-[11px] shadow-1">
      <div
        className="relative h-11 w-[58px] shrink-0 overflow-hidden rounded-[9px]"
        style={{ background: thumb }}
        aria-hidden="true"
      >
        <CarSilhouette className="absolute bottom-[-8%] left-1/2 w-[94%] -translate-x-1/2 fill-[rgba(255,255,255,0.9)]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12.5px] font-extrabold text-ink">{name}</div>
        <div className="mt-px truncate text-[10.5px] font-semibold text-ink-2">
          {trim}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <b className="block font-display text-[12.5px] font-bold text-ink">{price}</b>
        <span className="mt-[3px] inline-block rounded-pill bg-green-tint px-1.5 py-0.5 text-[9.5px] font-extrabold text-green">
          {score}
        </span>
      </div>
    </div>
  );
}
