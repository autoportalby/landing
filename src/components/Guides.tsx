/**
 * Guides.tsx — "Полезное перед покупкой" (Useful guides) section.
 *
 * Faithful port of the vrum.by landing "guides" section (vrum-landing.html #guides):
 *   surface-2 background, centered section head, and a 4-card guide grid
 *   (4 cols; 2 cols below 920px; 1 col below 520px). Each card links to a
 *   standalone article page, with a lazy-loaded cover image, a colored category
 *   label, a title and a reading-time meta line. Hover lifts the card.
 *
 * CSS-only motion (hover lift), so this stays a Server Component. Motion is
 * guarded by prefers-reduced-motion.
 */

type Guide = {
  href: string;
  img: string;
  alt: string;
  cat: string;
  catColor: string; // Tailwind class or arbitrary value
  title: string;
  meta: string;
};

const GUIDES: Guide[] = [
  {
    href: "/novosti/kak-proverit-avto-pered-pokupkoy",
    img: "/img/guide-inspect.jpg",
    alt: "Осмотр авто перед покупкой",
    cat: "Чек-лист",
    catColor: "text-blue",
    title: "Как проверить авто перед покупкой",
    meta: "7 мин чтения",
  },
  {
    href: "/novosti/priznaki-skruchennogo-probega",
    img: "/img/guide-odometer.jpg",
    alt: "Одометр и признаки скрутки пробега",
    cat: "Риски",
    catColor: "text-[#9a6300]",
    title: "7 признаков скрученного пробега",
    meta: "5 мин чтения",
  },
  {
    href: "/novosti/voprosy-prodavcu",
    img: "/img/guide-questions.jpg",
    alt: "Вопросы продавцу авто",
    cat: "Переговоры",
    catColor: "text-[#0a7a48]",
    title: "Какие вопросы задать продавцу",
    meta: "6 мин чтения",
  },
  {
    href: "/novosti/stoimost-vladeniya",
    img: "/img/guide-cost.jpg",
    alt: "Стоимость владения автомобилем",
    cat: "Деньги",
    catColor: "text-blue-ink",
    title: "Из чего складывается стоимость владения",
    meta: "8 мин чтения",
  },
];

export default function Guides() {
  return (
    <section
      id="guides"
      aria-labelledby="guides-title"
      className="guides bg-surface-2 scroll-mt-[66px]"
      style={{
        paddingTop: "clamp(56px,8vw,96px)",
        paddingBottom: "clamp(56px,8vw,96px)",
      }}
    >
      {/* Scoped, CSS-only hover lift. */}
      <style>{`
        #guides .guide {
          transition: transform .22s ease, box-shadow .22s ease;
        }
        #guides .guide:hover {
          transform: translateY(-3px);
          box-shadow: var(--sh-2);
        }
        @media (prefers-reduced-motion: reduce) {
          #guides .guide,
          #guides .guide:hover { transform: none; transition: none; }
        }
      `}</style>

      <div className="mx-auto w-full max-w-wrap px-[22px]">
        {/* sec-head */}
        <div className="mx-auto max-w-[640px] text-center" data-reveal>
          <p className="text-[12.5px] font-extrabold uppercase tracking-[1.2px] text-blue">
            Полезное перед покупкой
          </p>
          <h2
            id="guides-title"
            className="mt-3 font-display font-bold text-ink"
            style={{
              fontSize: "clamp(26px,3.4vw,38px)",
              letterSpacing: "-1px",
              lineHeight: 1.12,
            }}
          >
            Помогаем не ошибиться уже сейчас
          </h2>
          <p className="mx-auto mt-3.5 text-[16px] font-medium text-ink-2">
            Пока готовим продукт — делимся тем, что убережёт от типичных ошибок.
          </p>
        </div>

        {/* guide grid: 4 cols / 2 (<920) / 1 (<520) */}
        <div className="mt-[clamp(36px,5vw,56px)] grid grid-cols-1 gap-[22px] min-[520px]:grid-cols-2 min-[920px]:grid-cols-4">
          {GUIDES.map((g) => (
            <a
              key={g.href}
              href={g.href}
              className="guide group flex flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-1 focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-blue"
              data-reveal
            >
              <div className="aspect-[16/10] overflow-hidden bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.img}
                  alt={g.alt}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col p-5">
                <span
                  className={`text-[10.5px] font-extrabold uppercase tracking-[0.6px] ${g.catColor}`}
                >
                  {g.cat}
                </span>
                <h3 className="mt-1.5 text-[17px] font-extrabold leading-[1.25] tracking-[-0.2px] text-ink">
                  {g.title}
                </h3>
                <div className="mt-2 text-[13px] font-medium text-ink-3">
                  {g.meta}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
