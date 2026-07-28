import Link from "next/link";

import NotFoundSearch from "@/components/NotFoundSearch";

/**
 * 404 — search-first concept ported into the app (design/404-vroom-concept-3).
 *
 * Not an error screen: the lost page becomes the first touch with vrum's core
 * feature — AI car search. Brand-native (blue-led, Unbounded display / Manrope
 * body, the same logo as the landing). One deliberate warm accent survives from
 * the concept: the orange navigation line + waypoint dot crossing the screen.
 *
 * Server Component. Decorative scene is aria-hidden; content is one <main> with
 * a single <h1>. Motion is transform/opacity only and reduced-motion-guarded.
 * NOTE: actions link to "/" for now — wire AI search to the real flow later.
 */

export default function NotFound() {
  return (
    <main className="nf relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-surface">
      <style>{CSS}</style>

      {/* ── Topographic road-map background (decorative) ── */}
      <svg
        className="nf-topo"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="nf-tglow" cx="50%" cy="34%" r="42%">
            <stop offset="0%" stopColor="#1e5bff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#1e5bff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#nf-tglow)" />
        <g fill="none" stroke="#e9ebf0" strokeWidth="1.5">
          <path d="M-40 250 C 300 180, 520 320, 760 250 S 1180 150, 1500 260" />
          <path d="M-40 300 C 300 235, 520 372, 760 300 S 1180 205, 1500 312" />
          <path d="M-40 355 C 300 295, 520 430, 760 358 S 1180 262, 1500 366" />
        </g>
        {/* the deliberate warm accent: orange route across the screen + waypoint */}
        <path
          id="nf-route"
          className="nf-navline"
          d="M-40 540 C 300 470, 520 610, 760 540 S 1180 440, 1500 550"
          fill="none"
          stroke="#ff7a00"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* waypoint dot rides the route; pulses like the "AI-поиск готов" status dot */}
        <g className="nf-puck">
          <circle className="nf-puck-ping" r="5" fill="#ff7a00" />
          <circle r="5" fill="#ff7a00" />
        </g>
      </svg>

      {/* ── Wordmark (same as the landing nav) ── */}
      <Link
        href="/"
        aria-label="vrum.by — на главную"
        className="nf-brand relative z-20 mt-[clamp(26px,4vh,44px)] flex items-center gap-[10px] outline-none focus-visible:rounded-[6px] focus-visible:outline focus-visible:outline-[2.5px] focus-visible:outline-offset-[3px] focus-visible:outline-blue"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[linear-gradient(150deg,#3D72FF,#0B3FCC)] shadow-[0_5px_14px_rgba(30,91,255,0.32)]">
          <svg className="nf-logo-icon h-[17px] w-[17px]" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3 14 10 21 12 14 14 12 21 10 14 3 12 10 10z" fill="#fff" />
          </svg>
        </span>
        <span className="font-display text-[20px] font-extrabold leading-none tracking-[-0.6px]">
          <span className="text-blue">vrum</span>
          <span className="font-bold text-ink-3">.by</span>
        </span>
      </Link>

      {/* ── Hero ── */}
      <div className="relative z-20 flex w-full max-w-[720px] flex-1 flex-col items-center justify-center px-[22px] pb-[clamp(40px,6vh,72px)] pt-[clamp(16px,3vh,36px)] text-center">
        <span className="nf-status">
          <span className="nf-status-dot" />
          скоро: AI-подбор
        </span>

        <div className="nf-digits" aria-hidden="true">
          <i>4</i>04
        </div>

        <h1 className="mt-1.5 text-[clamp(24px,3vw,34px)] font-extrabold leading-[1.1] tracking-[-0.8px] text-ink">
          <span className="sr-only">Ошибка 404. </span>Не нашли страницу.
        </h1>
        <p className="mt-3 text-[clamp(15.5px,1.4vw,18px)] leading-[1.5] text-ink-2">
          Но мы можем найти автомобиль вашей мечты.
        </p>

        {/* AI search → honest pre-launch lead capture (real input, no fake field) */}
        <NotFoundSearch />

        <Link href="/" className="nf-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Вернуться на главную
        </Link>
      </div>
    </main>
  );
}

const CSS = `
  .nf {
    background:
      radial-gradient(1200px 680px at 50% -10%, #eef3ff 0%, transparent 60%),
      radial-gradient(900px 620px at 50% 120%, #f2f6ff 0%, transparent 58%),
      var(--surface);
  }
  .nf-topo { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; }

  /* Logo star spins on hover — same as the landing nav. */
  @keyframes nf-logo-spin { from { transform: rotate(0deg); } to { transform: rotate(720deg); } }
  .nf-brand:hover .nf-logo-icon { animation: nf-logo-spin 1.7s cubic-bezier(.15,.8,.25,1); transform-origin: 50% 50%; }

  .nf-status {
    display: inline-flex; align-items: center; gap: 9px; margin-bottom: 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11.5px; font-weight: 500; letter-spacing: 1.6px;
    text-transform: uppercase; color: var(--blue-ink);
  }
  .nf-status-dot { width: 6px; height: 6px; border-radius: 999px; background: var(--blue); animation: nf-ping 1.9s infinite; }

  .nf-digits {
    font-family: var(--font-sans); font-weight: 800;
    font-size: clamp(96px, 17vw, 190px); line-height: 0.9;
    letter-spacing: 2px; color: transparent;
    -webkit-text-stroke: 1.8px #aeb7c6; margin-bottom: 4px;
  }
  .nf-digits i { font-style: normal; color: transparent; -webkit-text-stroke: 1.8px var(--blue); }

  .nf-search {
    margin-top: 30px; width: 100%; display: flex; align-items: center; gap: 10px;
    padding: 10px 10px 10px 18px; border-radius: 18px;
    background: rgba(255,255,255,.78); border: 1px solid var(--line);
    box-shadow: 0 22px 50px rgba(30,91,255,.12), 0 8px 22px rgba(16,23,38,.07);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    transition: border-color .16s, box-shadow .16s;
  }
  .nf-search:focus-within {
    border-color: var(--blue);
    box-shadow: 0 0 0 3px rgba(30,91,255,.18), 0 22px 50px rgba(30,91,255,.14), 0 8px 22px rgba(16,23,38,.07);
  }
  .nf-search-input {
    flex: 1; min-width: 0; border: 0; background: transparent; outline: none;
    font-family: var(--font-sans); font-size: 16px; color: var(--ink);
  }
  .nf-search-input::placeholder { color: var(--ink-2); }
  .nf-btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; flex: none;
    min-height: 50px; padding: 0 22px; border-radius: 13px; white-space: nowrap; cursor: pointer;
    border: 0; font-family: var(--font-sans); font-weight: 800; font-size: 15px; color: #fff; text-decoration: none;
    background: linear-gradient(140deg, var(--blue), var(--blue-ink));
    box-shadow: 0 10px 22px rgba(30,91,255,.34);
    transition: transform .16s cubic-bezier(.22,.61,.36,1), box-shadow .16s cubic-bezier(.22,.61,.36,1);
  }

  .nf-skeleton {
    margin-top: 30px; width: 100%; height: 70px; border-radius: 18px;
    border: 1px solid var(--line); background: rgba(255,255,255,.5);
  }

  .nf-note {
    margin-top: 30px; max-width: 480px;
    font-size: 14.5px; line-height: 1.5; color: var(--ink-2);
  }
  .nf-note b { color: var(--ink); font-weight: 800; }
  .nf-note + .nf-search { margin-top: 12px; }

  .nf-hint { margin-top: 14px; font-size: 13.5px; color: var(--ink-3); }
  .nf-hint b { color: var(--ink-2); font-weight: 700; }
  .nf-link { border: 0; background: none; padding: 0; cursor: pointer; font: inherit; color: var(--blue); font-weight: 700; }
  .nf-link:hover { text-decoration: underline; }

  .nf-done {
    margin-top: 30px; width: 100%; display: flex; align-items: flex-start; gap: 12px;
    padding: 18px 20px; border-radius: 18px; text-align: left;
    background: var(--green-tint); border: 1px solid #c8ecdb;
  }
  .nf-done-check { flex: none; display: grid; place-items: center; width: 30px; height: 30px;
    border-radius: 999px; background: var(--green); }
  .nf-done-text { font-size: 15px; line-height: 1.5; color: var(--ink-2); }
  .nf-done-text b { color: var(--ink); font-weight: 800; }
  .nf-done-q { display: block; margin-top: 3px; font-size: 13px; color: var(--ink-3); }
  .nf-btn:hover { transform: translateY(-2px); box-shadow: 0 16px 32px rgba(30,91,255,.46); }
  .nf-btn:focus-visible { outline: 2.5px solid var(--blue); outline-offset: 3px; }

  .nf-prompt {
    display: inline-flex; align-items: center; gap: 8px; padding: 9px 15px; border-radius: 999px;
    cursor: pointer; font-family: var(--font-sans);
    font-size: 13.5px; font-weight: 500; color: var(--ink); text-decoration: none;
    background: rgba(255,255,255,.7); border: 1px solid var(--line);
    box-shadow: 0 4px 14px rgba(16,23,38,.05);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    transition: transform .16s cubic-bezier(.22,.61,.36,1), border-color .16s, box-shadow .16s;
  }
  .nf-prompt:hover { transform: translateY(-2px); border-color: var(--blue); box-shadow: 0 10px 22px rgba(30,91,255,.14); }
  .nf-prompt:focus-visible { outline: 2.5px solid var(--blue); outline-offset: 3px; }
  .nf-prompt-arrow { color: var(--blue); font-weight: 800; }

  .nf-back {
    margin-top: 26px; display: inline-flex; align-items: center; gap: 7px;
    font-family: var(--font-sans); font-weight: 700; font-size: 14.5px;
    color: var(--ink-2); text-decoration: none;
    padding: 6px 4px; border-bottom: 1.5px solid transparent;
    transition: color .16s, border-color .16s;
  }
  .nf-back:hover { color: var(--ink); }
  .nf-back:focus-visible { outline: 2.5px solid var(--blue); outline-offset: 3px; }

  @keyframes nf-ping { 0%{box-shadow:0 0 0 0 rgba(30,91,255,.5);} 70%{box-shadow:0 0 0 8px rgba(30,91,255,0);} 100%{box-shadow:0 0 0 0 rgba(30,91,255,0);} }
  @keyframes nf-float { 0%,100%{transform:translateY(0);opacity:.5;} 50%{transform:translateY(-14px);opacity:1;} }
  @keyframes nf-blink { 0%,50%{opacity:1;} 51%,100%{opacity:0;} }
  @keyframes nf-dash { to { stroke-dashoffset: 0; } }
  .nf-navline { stroke-dasharray: 2600; stroke-dashoffset: 2600; animation: nf-dash 2.6s cubic-bezier(.22,.61,.36,1) .3s forwards; }

  /* Waypoint dot rides the route left→right (loops from the left), inner dot blinks. */
  .nf-puck {
    offset-path: path("M-40 540 C 300 470, 520 610, 760 540 S 1180 440, 1500 550");
    offset-rotate: 0deg;
    animation: nf-ride 24s linear infinite;
  }
  .nf-puck-ping {
    transform-box: fill-box; transform-origin: center;
    animation: nf-puck-ping 1.9s ease-out infinite;
  }
  @keyframes nf-ride { from { offset-distance: 0%; } to { offset-distance: 100%; } }
  @keyframes nf-puck-ping { 0%{transform:scale(1);opacity:.5;} 70%,100%{transform:scale(3.4);opacity:0;} }

  @media (prefers-reduced-motion: reduce) {
    .nf-navline { stroke-dashoffset: 0; }
    .nf-brand:hover .nf-logo-icon { animation: none; }
    .nf-puck { animation: none; offset-distance: 40%; }
    .nf-puck-ping { animation: none; opacity: 0; }
  }

  @media (max-width: 560px) {
    .nf-search { flex-wrap: wrap; padding: 14px; }
    .nf-search-ph { min-width: 55%; }
    .nf-btn { width: 100%; }
    .nf-status { display: none; }
  }
`;
