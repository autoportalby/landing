# TODO — vrum-next

- [ ] **Заменить плейсхолдер-контакты.** В `src/components/Footer.tsx` стоит заглушка `hello@vrum.by` (mailto). Перед запуском заменить на реальный контактный адрес/канал.
- [ ] **Включить аналитику.** Создать счётчики и задать в env хостинга `NEXT_PUBLIC_YM_ID` (Яндекс.Метрика) и `NEXT_PUBLIC_GA_ID` (GA4, `G-…`). Без них аналитика инертна (код готов: `src/components/Analytics.tsx`, `src/lib/analytics.ts`).
