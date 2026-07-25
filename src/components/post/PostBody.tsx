import { Fragment } from "react";

import type { Block, Span } from "@/lib/blocks";
import { tocFromBlocks } from "@/lib/blocks";

/**
 * PostBody — type-safe renderer for a post's `Block[]` body.
 *
 * Server component. Never uses `dangerouslySetInnerHTML`; every block maps to
 * JSX. Styling mirrors the original article prototypes (`.prose`, `.callout`,
 * `.toc`, `.costs` table, `.art-banner`) using Tailwind v4 + brand tokens
 * (`--blue`, `--green`, `--amber`, `--ink*`, `--line*`, `--surface*`).
 */

function renderSpans(spans: Span[]) {
  return spans.map((span, i) => {
    if (typeof span === "string") return <span key={i}>{span}</span>;
    if (span.href) {
      return (
        <a
          key={i}
          href={span.href}
          className="text-blue underline-offset-2 hover:underline"
        >
          {span.text}
        </a>
      );
    }
    if (span.bold) {
      return (
        <b key={i} className="font-bold text-ink">
          {span.text}
        </b>
      );
    }
    return <span key={i}>{span.text}</span>;
  });
}

function Toc({ items }: { items: { text: string; anchor: string }[] }) {
  return (
    <nav
      aria-label="Содержание"
      className="mb-2 rounded-r border border-line-2 bg-surface-2 px-5 py-[18px]"
    >
      <h2 className="mb-2.5 text-[12px] font-extrabold uppercase tracking-[0.6px] text-ink-3">
        Что проверяем
      </h2>
      <ol className="m-0 list-none p-0 [column-gap:26px] min-[561px]:columns-2">
        {items.map((it, i) => (
          <li
            key={it.anchor}
            className="my-1.5 break-inside-avoid text-[14px] font-semibold"
          >
            <a href={`#${it.anchor}`} className="text-ink-2 hover:text-blue">
              <span className="font-extrabold text-blue">{i + 1}.</span>
              {" "}
              {it.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function renderBlock(block: Block, i: number, h2Num = 0) {
  {
    switch (block.type) {
      case "heading":
            return block.level === 2 ? (
              <h2
                key={i}
                id={block.anchor}
                className="mt-10 scroll-mt-[80px] font-display text-[clamp(22px,3vw,30px)] font-bold text-ink"
              >
                {h2Num > 0 ? (
                  <span className="mr-2.5 font-bold text-blue">
                    {String(h2Num).padStart(2, "0")}
                  </span>
                ) : null}
                {block.text}
              </h2>
            ) : (
              <h3 key={i} className="mt-7 text-[20px] font-bold text-ink">
                {block.text}
              </h3>
            );

          case "paragraph":
            return (
              <p key={i} className="mt-4 text-[16.5px] leading-[1.7] text-ink-2">
                {renderSpans(block.spans)}
              </p>
            );

          case "list":
            return block.ordered ? (
              <ol
                key={i}
                className="mt-4 list-decimal space-y-2 pl-6 text-[16.5px] leading-[1.7] text-ink-2 marker:font-bold marker:text-blue"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderSpans(item)}</li>
                ))}
              </ol>
            ) : (
              <ul
                key={i}
                className="mt-4 list-disc space-y-2 pl-6 text-[16.5px] leading-[1.7] text-ink-2 marker:text-blue"
              >
                {block.items.map((item, j) => (
                  <li key={j}>{renderSpans(item)}</li>
                ))}
              </ul>
            );

          case "callout": {
            const isTip = block.variant === "tip";
            return (
              <div
                key={i}
                className={`my-6 rounded-r border-l-4 px-[18px] py-4 text-[15.5px] leading-[1.55] text-ink-2 ${
                  isTip
                    ? "border-green bg-green-tint"
                    : "border-amber bg-amber-tint"
                }`}
              >
                {block.title ? (
                  <b
                    className={`mb-1 block text-[12px] font-extrabold uppercase tracking-[0.5px] ${
                      isTip ? "text-green" : "text-amber"
                    }`}
                  >
                    {block.title}
                  </b>
                ) : null}
                <p className="m-0 font-medium">{renderSpans(block.body)}</p>
              </div>
            );
          }

          case "table":
            return (
              <div key={i} className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse text-[15px]">
                  <thead>
                    <tr>
                      {block.head.map((h, j) => (
                        <th
                          key={j}
                          className="border border-line bg-surface-2 px-3 py-2.5 text-left font-extrabold text-ink"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td
                            key={c}
                            className="border border-line px-3 py-2.5 text-ink-2"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case "image":
            return (
              <figure key={i} className="mt-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={block.src}
                  alt={block.alt}
                  loading="lazy"
                  className="w-full rounded-[16px]"
                />
                {block.caption ? (
                  <figcaption className="mt-2 text-[13.5px] text-ink-3">
                    {block.caption}
                  </figcaption>
                ) : null}
              </figure>
            );

      default:
        return null;
    }
  }
}

/**
 * Lede — the intro paragraph(s) that precede the first heading. Rendered inside
 * the article <header> (above its divider), larger than body text, matching the
 * original `.lede` styling.
 */
export function Lede({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) =>
        block.type === "paragraph" ? (
          <p
            key={i}
            className="mt-5 text-[clamp(17px,2vw,19px)] font-medium leading-[1.6] text-ink-2"
          >
            {renderSpans(block.spans)}
          </p>
        ) : (
          <Fragment key={i}>{renderBlock(block, i)}</Fragment>
        ),
      )}
    </>
  );
}

export default function PostBody({ blocks }: { blocks: Block[] }) {
  const toc = tocFromBlocks(blocks);
  const showToc = toc.length >= 3;
  // Place the TOC right before the first heading, so any intro (lede)
  // paragraphs render above it — matching the original article layout.
  const firstHeadingIdx = blocks.findIndex((b) => b.type === "heading");

  // Sequential 1-based number for each level-2 heading (0 for other blocks).
  let h2 = 0;
  const h2Nums = blocks.map((b) =>
    b.type === "heading" && b.level === 2 ? ++h2 : 0,
  );

  return (
    <div className="post-body">
      {blocks.map((block, i) => (
        <Fragment key={i}>
          {showToc && i === firstHeadingIdx ? <Toc items={toc} /> : null}
          {renderBlock(block, i, h2Nums[i])}
        </Fragment>
      ))}
    </div>
  );
}
