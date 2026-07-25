import Link from "next/link";

/**
 * Pager — server-side pagination control for `?page=N` routes.
 *
 * Mirrors the original `.pager` styling from novosti.html: prev (‹) / numbered
 * pages / next (›), each a 42px rounded-12 bordered tile with extrabold text.
 * The current page uses the filled blue `.on` style; disabled ends render as
 * inert spans at 40% opacity.
 *
 * NOTE: colors are applied per-state (never stacked) so Tailwind utility order
 * can't leave the active tile with the wrong background/text color.
 */

// Layout only — no background/text color (each state sets its own below).
const base =
  "grid h-[42px] min-w-[42px] place-items-center rounded-[12px] border px-[13px] text-[15px] font-extrabold shadow-1";
const idle = `${base} border-line bg-surface text-ink`;
const idleLink = `${idle} transition-colors hover:border-blue hover:text-blue`;
const active = `${base} border-blue bg-blue text-white`;

export default function Pager({
  page,
  pages,
  basePath = "",
}: {
  page: number;
  pages: number;
  basePath?: string;
}) {
  if (pages <= 1) return null;

  const href = (n: number) => `${basePath}?page=${n}`;
  const nums = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <nav
      className="mt-9 flex items-center justify-center gap-2"
      aria-label="Страницы"
    >
      {page <= 1 ? (
        <span className={`${idle} opacity-40`} aria-hidden="true">
          ‹
        </span>
      ) : (
        <Link
          href={href(page - 1)}
          className={idleLink}
          aria-label="Предыдущая страница"
        >
          ‹
        </Link>
      )}

      {nums.map((n) =>
        n === page ? (
          <span key={n} aria-current="page" className={active}>
            {n}
          </span>
        ) : (
          <Link key={n} href={href(n)} className={idleLink}>
            {n}
          </Link>
        ),
      )}

      {page >= pages ? (
        <span className={`${idle} opacity-40`} aria-hidden="true">
          ›
        </span>
      ) : (
        <Link
          href={href(page + 1)}
          className={idleLink}
          aria-label="Следующая страница"
        >
          ›
        </Link>
      )}
    </nav>
  );
}
