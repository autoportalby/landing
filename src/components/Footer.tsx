import Link from "next/link";

/**
 * Footer section for the vrum.by landing page.
 *
 * Pure presentational / server component — the footer contains only anchor
 * and mailto links with no client-side interactivity, so no `"use client"`.
 *
 * 1:1 port of the prototype footer (vrum-landing.html):
 *   footer{background:#0e224a;color:#AEB7C7;padding:52px 0 34px}
 *   .foot-top{flex;justify-content:space-between;gap:30px;flex-wrap;pb:30;border-bottom}
 *   .foot-desc{max-width:340px;font-size:13.5px;line-height:1.6;margin-top:14px}
 *   .foot-links{flex;gap:56px;flex-wrap}
 *   .foot-col h4{#fff;12px;800;letter-spacing:.6px;uppercase;mb:14}
 *   .foot-col a{block;14px;mb:10;#AEB7C7 → hover #fff}
 *   .foot-bot{pt:22;12.5px;#6E7A90;flex;justify-content:space-between;gap:14;flex-wrap}
 */

const productLinks: { label: string; href: string }[] = [
  { label: "Как работает", href: "/#how" },
  { label: "Отличия", href: "/#why" },
  { label: "Полезное", href: "/#guides" },
  { label: "Новости", href: "/novosti" },
];

const linkClass =
  "mb-[10px] block text-[14px] text-[#AEB7C7] outline-none transition-colors duration-[.18s] hover:text-white focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-blue";
const colHeadClass =
  "mb-[14px] text-[12px] font-extrabold uppercase tracking-[.6px] text-white";

export default function Footer() {
  return (
    <footer
      className="bg-[#0e224a] text-[#AEB7C7]"
      style={{ padding: "52px 0 34px" }}
    >
      <div className="mx-auto w-full max-w-wrap px-[22px]">
        {/* foot-top */}
        <div className="flex flex-wrap justify-between gap-[30px] border-b border-white/[.08] pb-[30px]">
          {/* Left: brand mark + description */}
          <div>
            <Link
              href="/#top"
              aria-label="vrum.by — на главную"
              className="inline-flex items-center gap-2.5 rounded-md outline-none focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-blue"
            >
              <span
                aria-hidden="true"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px]"
                style={{
                  background: "linear-gradient(150deg,#3D72FF,#0B3FCC)",
                  boxShadow: "0 5px 14px rgba(30,91,255,.32)",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 3 14 10 21 12 14 14 12 21 10 14 3 12 10 10z"
                    fill="#fff"
                  />
                </svg>
              </span>
              <span
                className="font-display text-[20px] font-extrabold tracking-[-0.6px]"
                style={{ lineHeight: 1 }}
              >
                <span className="text-white">vrum</span>
                <span className="font-bold text-[#6E7A90]">.by</span>
              </span>
            </Link>

            <p className="mt-[14px] max-w-[340px] text-[13.5px] leading-[1.6]">
              Умный помощник по покупке автомобиля в Беларуси. Подбор с AI,
              вердикт по объявлению и проверка рисков — чтобы выбрать увереннее.
            </p>
          </div>

          {/* Right: link columns */}
          <div className="flex flex-wrap gap-[56px]">
            <nav aria-label="Продукт">
              <h2 className={colHeadClass}>Продукт</h2>
              {productLinks.map(({ label, href }) => (
                <Link key={href} href={href} className={linkClass}>
                  {label}
                </Link>
              ))}
            </nav>

            <nav aria-label="Связь">
              <h2 className={colHeadClass}>Связь</h2>
              <a href="mailto:hello@vrum.by" className={linkClass}>
                hello@vrum.by
              </a>
            </nav>
          </div>
        </div>

        {/* foot-bot */}
        <div className="flex flex-wrap justify-between gap-[14px] pt-[22px] text-[12.5px] text-[#6E7A90]">
          <span>© 2026 vrum.by · Продукт в разработке</span>
        </div>
      </div>
    </footer>
  );
}
