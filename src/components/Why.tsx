import type { ReactNode } from "react";

/**
 * "Why / Differences" section.
 *
 * Comparison table: "Обычная доска объявлений" (classifieds) vs. "vrum.by".
 * Pure presentational content — no interactivity — so this is a server
 * component. The `data-reveal` hooks let the page-level scroll-reveal script
 * animate it in (position-only, so content stays visible if JS/IO is absent);
 * that global behaviour already guards prefers-reduced-motion.
 */

type Row = {
  /** Classifieds ("old") side copy. */
  old: string;
  /** vrum.by ("new") side copy, with <b> emphasis inline. */
  neu: ReactNode;
};

const ROWS: Row[] = [
  {
    old: "Листаете сотни объявлений сами",
    neu: (
      <>
        <b>Сравнит 2–5 машин</b> и скажет, какую брать
      </>
    ),
  },
  {
    old: "Обновляете ленту каждый день",
    neu: (
      <>
        Сам <b>сообщит о новых авто и падении цены</b>
      </>
    ),
  },
  {
    old: "Риски проверяете по разным сайтам",
    neu: (
      <>
        <b>VIN, скрутка, залог</b> и число владельцев — заранее
      </>
    ),
  },
  {
    old: "Видите только ценник",
    neu: (
      <>
        Покажет <b>реальную стоимость в месяц</b>: ТО, налог, топливо
      </>
    ),
  },
  {
    old: "Платные пакеты и лимиты на подачу",
    neu: (
      <>
        <b>Бесплатная подача</b> без лимитов
      </>
    ),
  },
  {
    old: "Объявление пишете сами",
    neu: (
      <>
        <b>AI оценит цену и напишет</b> объявление
      </>
    ),
  },
];

/** Small compass/star brand mark used in the "new" column header. */
function CompassMark() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M12 2l2.4 7.2L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z"
        fill="var(--blue)"
      />
    </svg>
  );
}

/** Bare "cross" marker for the classifieds column (no background circle). */
function CrossIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="mt-[1px] h-5 w-5 shrink-0"
    >
      <path
        d="M6 6 18 18M18 6 6 18"
        stroke="var(--ink-3)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Bare green "check" marker for the vrum.by column (no background circle). */
function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="mt-[1px] h-5 w-5 shrink-0"
    >
      <path
        d="m5 12.5 4.5 4.5L19 7.5"
        stroke="var(--green)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Why() {
  return (
    <section
      id="why"
      className="py-[clamp(56px,8vw,96px)] scroll-mt-[66px]"
    >
      <div className="mx-auto w-full max-w-wrap px-6">
        {/* Section heading */}
        <div
          data-reveal
          className="mx-auto mb-9 max-w-[620px] text-center max-[620px]:mb-7"
        >
          <p className="text-[12.5px] font-extrabold uppercase tracking-[1.2px] text-blue">
            В чём разница
          </p>
          <h2 className="mt-3 font-display text-[clamp(26px,3.4vw,38px)] font-bold leading-[1.12] tracking-[-1px] text-ink">
            Не доска объявлений,
            <br />а помощник по покупке
          </h2>
          <p className="mt-3 text-[16px] font-medium text-ink-2">
            Классифайд показывает всё подряд. Врум помогает выбрать.
          </p>
        </div>

        {/* Comparison grid: header-old, header-new, then old/new per row */}
        <div
          data-reveal
          className="mx-auto grid max-w-[920px] grid-cols-2 overflow-hidden rounded-r border border-line bg-surface shadow-2"
        >
          {/* Header — classifieds */}
          <div className="border-b border-line-2 px-5 py-4 text-[15px] font-extrabold text-ink-3 max-[620px]:px-3 max-[620px]:py-3 max-[620px]:text-[13.5px]">
            Обычная доска объявлений
          </div>
          {/* Header — vrum.by (tinted, with a vertical divider) */}
          <div
            className="flex items-center gap-2 border-b border-l border-line-2 px-5 py-4 text-[15px] font-extrabold text-blue-ink max-[620px]:px-3 max-[620px]:py-3 max-[620px]:text-[13.5px]"
            style={{ background: "rgba(30,91,255,.07)" }}
          >
            <CompassMark />
            vrum.by
          </div>

          {ROWS.map((row, i) => {
            const isLast = i === ROWS.length - 1;
            const border = isLast ? "" : "border-b border-line-2";
            return (
              <div key={i} className="contents">
                {/* Classifieds cell */}
                <div
                  className={`flex items-start gap-[11px] px-5 py-4 text-[14px] leading-[1.45] text-ink-2 max-[620px]:gap-2 max-[620px]:px-3 max-[620px]:py-3 max-[620px]:text-[13px] ${border}`}
                >
                  <CrossIcon />
                  <span>{row.old}</span>
                </div>
                {/* vrum.by cell — transparent body, only a left divider */}
                <div
                  className={`flex items-start gap-[11px] border-l border-line px-5 py-4 text-[14px] leading-[1.45] text-ink max-[620px]:gap-2 max-[620px]:px-3 max-[620px]:py-3 max-[620px]:text-[13px] [&_b]:font-bold [&_b]:text-ink ${border}`}
                >
                  <CheckIcon />
                  <span>{row.neu}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
