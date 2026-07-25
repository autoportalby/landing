/**
 * Typed content blocks for post bodies.
 *
 * Article/news bodies are stored as JSON `Block[]` and rendered by a type-safe
 * renderer (`src/components/post/PostBody.tsx`) — never via
 * `dangerouslySetInnerHTML`.
 */

export type Span = string | { text: string; bold?: boolean; href?: string };

export type Block =
  | { type: "heading"; level: 2 | 3; text: string; anchor: string }
  | { type: "paragraph"; spans: Span[] }
  | { type: "list"; ordered: boolean; items: Span[][] }
  | { type: "callout"; variant: "tip" | "warn"; title?: string; body: Span[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "image"; src: string; alt: string; caption?: string };

/** Headings, in document order, for building the table of contents. */
export function tocFromBlocks(blocks: Block[]): { text: string; anchor: string }[] {
  return blocks
    .filter((b): b is Extract<Block, { type: "heading" }> => b.type === "heading" && b.level === 2)
    .map((h) => ({ text: h.text, anchor: h.anchor }));
}
