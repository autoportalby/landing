/**
 * How.tsx — "Как это будет работать" (How It Works) section.
 *
 * Pixel-faithful port of the vrum.by landing "how" section:
 *   surface-2 background, centered section head, and a 3-column steps grid
 *   (collapses to 1 column below 760px). Each step is a white card with a
 *   numbered badge, title, description and a decorative "viz" preview:
 *     1. a search input with a blinking caret
 *     2. two ranked car mini-cards with match-score badges
 *     3. a verdict block with signal chips + verdict text.
 *
 * Motion is CSS-only (hover lift + blinking caret), so this stays a Server
 * Component. All motion is guarded by prefers-reduced-motion.
 */

const STEEL = "linear-gradient(150deg,#3a557e,#1c2b44)";
const BROWN = "linear-gradient(150deg,#6b4f2e,#3a2a16)";

type CarCard = { name: string; meta: string; score: string; bg: string };

const STEP2_CARDS: CarCard[] = [
  { name: "Toyota RAV4", meta: "$17 500 · 2015", score: "92", bg: STEEL },
  { name: "Hyundai Tucson", meta: "$16 400 · 2017", score: "88", bg: BROWN },
];

export default function How() {
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="how bg-surface-2 scroll-mt-[66px]"
      style={{
        paddingTop: "clamp(56px,8vw,96px)",
        paddingBottom: "clamp(56px,8vw,96px)",
      }}
    >
      {/* Scoped, CSS-only motion: step hover-lift + blinking caret. */}
      <style>{`
        #how .how-step {
          transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
        }
        #how .how-step:hover {
          transform: translateY(-4px);
          box-shadow: var(--sh-3);
          border-color: var(--blue-tint-2);
        }
        #how .how-no { transition: transform .22s ease; }
        #how .how-step:hover .how-no { transform: scale(1.08); }
        #how .how-caret {
          display: inline-block;
          width: 2px;
          height: 1.05em;
          margin-left: 1px;
          vertical-align: -2px;
          background: var(--ink);
          animation: how-vcaret 1.1s step-end infinite;
        }
        @keyframes how-vcaret { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        @media (prefers-reduced-motion: reduce) {
          #how .how-step,
          #how .how-step:hover,
          #how .how-no { transform: none; transition: none; }
          #how .how-caret { animation: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-wrap px-[22px]">
        {/* sec-head */}
        <div
          className="mx-auto max-w-[640px] text-center"
          data-reveal
        >
          <p className="text-[12.5px] font-extrabold uppercase tracking-[1.2px] text-blue">
            Как это будет работать
          </p>
          <h2
            id="how-title"
            className="mt-3 font-display font-bold text-ink"
            style={{
              fontSize: "clamp(26px,3.4vw,38px)",
              letterSpacing: "-1px",
              lineHeight: 1.12,
            }}
          >
            От «хочу что-то надёжное» до уверенного выбора
          </h2>
          <p className="mx-auto mt-3.5 max-w-[520px] text-[16px] font-medium text-ink-2">
            Три шага вместо десятков фильтров и сотен вкладок с объявлениями.
          </p>
        </div>

        {/* steps grid */}
        <div className="mt-[clamp(36px,5vw,56px)] grid grid-cols-1 gap-[22px] min-[760px]:grid-cols-3">
          {/* STEP 1 */}
          <article
            className="how-step flex flex-col rounded-r border border-line bg-surface p-[26px] shadow-1"
            data-reveal
          >
            <div
              aria-hidden="true"
              className="how-no grid size-10 place-items-center rounded-[12px] bg-blue-tint font-display text-[14px] font-extrabold text-blue"
            >
              1
            </div>
            <h3 className="mt-4 font-display text-[19px] font-bold tracking-[-0.3px] text-ink">
              Опишите, что нужно
            </h3>
            <p className="mt-2 flex-1 text-[14.5px] font-medium leading-[1.55] text-ink-2">
              Бюджет, город и для чего авто — семье, в город или на трассу.
              Простым языком, без технических терминов.
            </p>

            {/* viz: vinput */}
            <div
              aria-hidden="true"
              className="mt-5 rounded-[14px] border border-line-2 bg-surface-2 p-3.5"
            >
              <div className="flex items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3.5 py-3 shadow-1">
                <span
                  className="grid size-[26px] shrink-0 place-items-center rounded-[8px]"
                  style={{ background: "linear-gradient(150deg,#3D72FF,#0B3FCC)" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 14 10 21 12 14 14 12 21 10 14 3 12 10 10z" fill="#fff" />
                  </svg>
                </span>
                <span className="text-[13.5px] font-medium text-ink">
                  «Надёжный кроссовер на автомате до $18k»
                  <span className="how-caret" />
                </span>
              </div>
            </div>
          </article>

          {/* STEP 2 */}
          <article
            className="how-step flex flex-col rounded-r border border-line bg-surface p-[26px] shadow-1"
            data-reveal
          >
            <div
              aria-hidden="true"
              className="how-no grid size-10 place-items-center rounded-[12px] bg-blue-tint font-display text-[14px] font-extrabold text-blue"
            >
              2
            </div>
            <h3 className="mt-4 font-display text-[19px] font-bold tracking-[-0.3px] text-ink">
              AI подберёт варианты
            </h3>
            <p className="mt-2 flex-1 text-[14.5px] font-medium leading-[1.55] text-ink-2">
              Модели под ваш сценарий и конкретные объявления, отсортированные
              по тому, насколько они вам подходят.
            </p>

            {/* viz: two side-by-side car mini-cards, each with a photo tile
               (gradient + car silhouette) and an overlaid match-score badge */}
            <div
              aria-hidden="true"
              className="mt-5 grid grid-cols-2 gap-2.5 rounded-[14px] border border-line-2 bg-surface-2 p-3.5"
            >
              {STEP2_CARDS.map((c) => (
                <div
                  key={c.name}
                  className="overflow-hidden rounded-[12px] border border-line bg-surface shadow-1"
                >
                  <div className="relative aspect-[16/10]" style={{ background: c.bg }}>
                    <svg
                      viewBox="0 0 240 90"
                      className="absolute bottom-[-8%] left-1/2 w-[92%] -translate-x-1/2"
                      fill="rgba(255,255,255,.9)"
                    >
                      <path d="M12 64c-3 0-6-2-6-6 0-7 6-10 14-12l14-3 18-15c6-5 14-8 24-9l34-2c14 0 26 3 38 11l16 11 28 4c12 2 20 7 20 15 0 4-3 6-7 6h-18a18 18 0 0 1-35 0H65a18 18 0 0 1-35 0H12z" />
                      <circle cx="47" cy="63" r="11" fill="rgba(14,23,38,.55)" />
                      <circle cx="170" cy="63" r="11" fill="rgba(14,23,38,.55)" />
                    </svg>
                    <span className="absolute left-1.5 top-1.5 grid min-w-6 place-items-center rounded-[7px] bg-green px-1.5 py-0.5 font-display text-[11px] font-extrabold text-white">
                      {c.score}
                    </span>
                  </div>
                  <div className="px-2.5 py-2">
                    <div className="truncate text-[12.5px] font-bold text-ink">
                      {c.name}
                    </div>
                    <div className="text-[11.5px] font-medium text-ink-3">
                      {c.meta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* STEP 3 */}
          <article
            className="how-step flex flex-col rounded-r border border-line bg-surface p-[26px] shadow-1"
            data-reveal
          >
            <div
              aria-hidden="true"
              className="how-no grid size-10 place-items-center rounded-[12px] bg-blue-tint font-display text-[14px] font-extrabold text-blue"
            >
              3
            </div>
            <h3 className="mt-4 font-display text-[19px] font-bold tracking-[-0.3px] text-ink">
              Даст вердикт
            </h3>
            <p className="mt-2 flex-1 text-[14.5px] font-medium leading-[1.55] text-ink-2">
              Честная ли цена, какие есть риски и что проверить перед покупкой —
              понятным языком.
            </p>

            {/* viz: vverdict — white card, blue-tint-2 border, gradient left bar */}
            <div
              aria-hidden="true"
              className="relative mt-5 flex flex-col gap-2.5 overflow-hidden rounded-[14px] border border-blue-tint-2 bg-surface p-3.5 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[linear-gradient(180deg,var(--blue),var(--green))]"
            >
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-pill bg-green-tint px-2.5 py-1.5 text-[12.5px] font-bold text-green">
                  <span aria-hidden="true">✓</span> Цена честная
                </span>
                <span className="inline-flex items-center gap-1 rounded-pill bg-amber-tint px-2.5 py-1.5 text-[12.5px] font-bold text-amber">
                  <span aria-hidden="true">⚠</span> Проверить пробег
                </span>
              </div>
              <p className="text-[13px] font-medium leading-[1.5] text-ink-2">
                Хороший вариант для семьи, цена ниже рынка на 5%.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
