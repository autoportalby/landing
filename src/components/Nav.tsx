"use client";

import { useEffect } from "react";
import { useState } from "react";

/** Compass-star brand mark. */
function CompassStar() {
  return (
    <svg
      className="logo-icon h-[17px] w-[17px]"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 3 14 10 21 12 14 14 12 21 10 14 3 12 10 10z"
        fill="#fff"
      />
    </svg>
  );
}

const LINKS: { label: string; href: string }[] = [
  { label: "Как это работает", href: "/#how" },
  { label: "Отличия", href: "/#why" },
  { label: "Полезное", href: "/#guides" },
  { label: "Новости", href: "/novosti" },
];

const focusRing =
  "outline-none focus-visible:outline-[2.5px] focus-visible:outline focus-visible:outline-blue focus-visible:outline-offset-[3px] focus-visible:rounded-[6px]";

export default function Nav() {
  const [open, setOpen] = useState(false);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="nav-scope sticky top-0 z-50 border-b border-line-2 bg-[rgba(255,255,255,0.82)] backdrop-blur-[16px]">
      {/* Component-scoped keyframes / motion guards. */}
      <style>{`
        @keyframes logo-spin { from { transform: rotate(0deg); } to { transform: rotate(720deg); } }
        .nav-scope .brand:hover .logo-icon {
          animation: logo-spin 1.7s cubic-bezier(.15,.8,.25,1);
          transform-origin: 50% 50%;
        }
        @media (prefers-reduced-motion: reduce) {
          .nav-scope .brand:hover .logo-icon { animation: none; }
          .nav-scope .nav-anim { transition: none; }
        }
      `}</style>

      <div className="relative mx-auto flex h-[66px] max-w-wrap items-center gap-5 px-6">
        {/* Brand */}
        <a
          href="/#top"
          aria-label="vrum.by — на главную"
          className={`brand group flex shrink-0 items-center gap-[10px] ${focusRing}`}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[linear-gradient(150deg,#3D72FF,#0B3FCC)] shadow-[0_5px_14px_rgba(30,91,255,0.32)]">
            <CompassStar />
          </span>
          <span className="font-display text-[20px] font-extrabold leading-none tracking-[-0.6px]">
            <span className="text-blue">vrum</span>
            <span className="font-bold text-ink-3">.by</span>
          </span>
        </a>

        {/* Desktop links */}
        <nav
          aria-label="Основная навигация"
          className="ml-6 hidden items-center gap-[26px] max-[760px]:hidden min-[761px]:flex"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[14.5px] font-semibold text-ink-2 transition-colors hover:text-ink ${focusRing}`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Desktop CTA */}
        <a
          href="/#notify"
          className={`nav-anim hidden shrink-0 items-center justify-center gap-[9px] whitespace-nowrap rounded-[14px] bg-blue px-[18px] py-[11px] text-[14px] font-extrabold text-white shadow-[0_10px_24px_rgba(30,91,255,0.32)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(30,91,255,0.4)] max-[760px]:hidden min-[761px]:inline-flex ${focusRing}`}
        >
          Сообщить о запуске
        </a>

        {/* Burger */}
        <button
          type="button"
          aria-label="Меню"
          aria-expanded={open}
          aria-controls="navMobile"
          onClick={() => setOpen((v) => !v)}
          className={`hidden h-11 w-11 shrink-0 flex-col items-center justify-center gap-[5px] rounded-[10px] max-[760px]:flex ${focusRing}`}
        >
          <span
            className={`nav-anim block h-[2px] w-[22px] origin-center rounded-full bg-ink transition-transform duration-200 ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`nav-anim block h-[2px] w-[22px] rounded-full bg-ink transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`nav-anim block h-[2px] w-[22px] origin-center rounded-full bg-ink transition-transform duration-200 ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id="navMobile"
        aria-hidden={!open}
        inert={!open}
        className={`nav-anim absolute left-0 top-full hidden w-full border-b border-line-2 bg-surface shadow-2 transition-[opacity,transform] duration-200 max-[760px]:block ${
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <nav
          aria-label="Мобильная навигация"
          className="mx-auto flex max-w-wrap flex-col gap-1 px-6 py-4"
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`flex min-h-[44px] items-center text-[15.5px] font-semibold text-ink-2 transition-colors hover:text-ink ${focusRing}`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/#notify"
            onClick={() => setOpen(false)}
            className={`nav-anim mt-2 inline-flex min-h-[44px] items-center justify-center gap-[9px] whitespace-nowrap rounded-[14px] bg-blue px-[22px] py-[15px] text-[15.5px] font-extrabold text-white shadow-[0_10px_24px_rgba(30,91,255,0.32)] transition-[transform,box-shadow,background] duration-200 hover:-translate-y-px hover:shadow-[0_14px_30px_rgba(30,91,255,0.4)] ${focusRing}`}
          >
            Сообщить о запуске
          </a>
        </nav>
      </div>
    </header>
  );
}
