import { z } from "zod";

/**
 * Survey option keys.
 *
 * These mirror the one-click survey options in the landing spec
 * (`vrum-landing.html`, section `#survey`). Each option button carries a
 * CSS class `o-<key>`; the keys below are those suffixes:
 *
 *   o-price  -> "price"   Справедливая цена
 *   o-risk   -> "risk"    Скрытые риски
 *   o-choice -> "choice"  Большой выбор
 *   o-cost   -> "cost"    Стоимость владения
 *   o-post   -> "post"    Подать объявление
 *   o-sell   -> "sell"    Безопасная сделка
 */
export const SURVEY_OPTION_KEYS = [
  "price",
  "risk",
  "choice",
  "cost",
  "post",
  "sell",
] as const;

export type SurveyOptionKey = (typeof SURVEY_OPTION_KEYS)[number];

// POST /api/subscribe
export const subscribeSchema = z.object({
  email: z.email().trim().toLowerCase().max(320),
  source: z.string().trim().max(120).optional(),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;

// POST /api/vote
export const voteSchema = z.object({
  optionKey: z.enum(SURVEY_OPTION_KEYS),
});

export type VoteInput = z.infer<typeof voteSchema>;
